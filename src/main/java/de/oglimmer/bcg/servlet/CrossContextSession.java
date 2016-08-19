package de.oglimmer.bcg.servlet;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

/**
 * Provides cross web-app single sign on.<br/>
 * <connector> needs emptySessionPath="true" <br/>
 * <context> needs crossContext="true"
 * 
 * @author oli
 * 
 */
public enum CrossContextSession {
	INSTANCE;

	private static final String CONTEXT_ATT_NAME = "crossContextSessions";
	private static final String CONTEXT_NAME = "/swlcg";
	private static final String SESSION_ATT_NAME = "email";

	/**
	 * If the current session doesn't have @SESSION_ATT_NAME set, try to get
	 * from the context. If the context had it, register this session.
	 * 
	 * @param req
	 */
	public synchronized boolean retrieveSessionFromServletContext(
			HttpServletRequest req) {

		/**
		 * 1.) not logged in here and not logged in elsewhere => do nothing <br/>
		 * 2.) is logged in here and not logged out elsewhere => do nothing <br/>
		 * 3.) is logged in here but logged out elsewhere => invalidate here <br/>
		 * 4.) not logged in here but logged in elsewhere => take over session <br/>
		 * 5.) not logged in here but logged out elsewhere => do nothing <br/>
		 * 6.) is logged in here but logged in elsewhere with a different
		 * account => change login here <br/>
		 */
		boolean loggedIn = false;
		HttpSession currentSession = req.getSession();
		Map<String, String> map = getSafeMap(req);
		String attValue = map.get(currentSession.getId());
		if ("INV".equals(attValue)) {
			if (currentSession.getAttribute(SESSION_ATT_NAME) != null) {
				// System.out.println("invalidated by remote "
				// 		+ currentSession.getId());
				currentSession.invalidate();
			} else {
				// System.out.println("nothing (INV, but nothing here) "
				// 		+ currentSession.getId());
			}
		} else if (attValue != null
				&& currentSession.getAttribute(SESSION_ATT_NAME) == null) {
			currentSession.setAttribute(SESSION_ATT_NAME, attValue);
			loggedIn = true;
			// System.out.println("remote login " + currentSession.getId() + "="
			// 		+ attValue);
		} else if (attValue != null
				&& currentSession.getAttribute(SESSION_ATT_NAME) != null
				&& !attValue.equals(currentSession
						.getAttribute(SESSION_ATT_NAME))) {
			currentSession.setAttribute(SESSION_ATT_NAME, attValue);
			loggedIn = true;
			// System.out.println("remote replace login " + currentSession.getId()
			// 		+ "=" + attValue);
		} else {
			// System.out.println("nothing " + currentSession.getId() + "="
			// 		+ currentSession.getAttribute(SESSION_ATT_NAME));
		}
		return loggedIn;
	}

	/**
	 * Saves the current session into the context
	 * 
	 * @param req
	 * @param session
	 */
	public synchronized void saveSessionToServletContext(HttpServletRequest req) {
		HttpSession currentSession = req.getSession();
		assert currentSession.getAttribute(SESSION_ATT_NAME) != null;

		Map<String, String> map = getSafeMap(req);
		map.put(currentSession.getId(),
				(String) currentSession.getAttribute(SESSION_ATT_NAME));

		// System.out.println("saved " + currentSession.getId() + "="
		// 		+ currentSession.getAttribute(SESSION_ATT_NAME));
	}

	/**
	 * Invalidates this session and all other session associated with this
	 * session via the context.
	 * 
	 * @param req
	 */
	public synchronized void invalidateAllSessions(HttpServletRequest req) {
		HttpSession currentSession = req.getSession();
		// System.out.println("invalidated " + currentSession.getId());
		Map<String, String> map = getSafeMap(req);
		map.put(currentSession.getId(), "INV");
		currentSession.invalidate();
	}

	private Map<String, String> getSafeMap(HttpServletRequest req) {
		ServletContext crossContext = getServletContext(req);
		Map<String, String> ccsm = null;
		if (crossContext != null) {
			ccsm = getMapFromContext(crossContext);
		}

		if (ccsm == null) {
			ccsm = new HashMap<String, String>();
			if (crossContext != null) {
				// System.out.println("Added context");
				crossContext.setAttribute(CONTEXT_ATT_NAME, ccsm);
			}
		}
		return ccsm;
	}

	@SuppressWarnings("unchecked")
	private Map<String, String> getMapFromContext(ServletContext crossContext) {
		return (Map<String, String>) crossContext
				.getAttribute(CONTEXT_ATT_NAME);
	}

	private ServletContext getServletContext(HttpServletRequest req) {
		return req.getSession().getServletContext().getContext(CONTEXT_NAME);
	}

}
