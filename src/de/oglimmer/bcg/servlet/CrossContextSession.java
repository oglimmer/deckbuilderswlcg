package de.oglimmer.bcg.servlet;

import java.lang.ref.WeakReference;
import java.util.HashMap;
import java.util.Iterator;
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
	 * @return true if SESSION_ATT_NAME was retrieved from the context
	 */
	public synchronized boolean retrieveSessionFromServletContext(
			HttpServletRequest req) {
		boolean loggedIn = false;
		try {
			HttpSession currentSession = req.getSession();
			if (currentSession.getAttribute(SESSION_ATT_NAME) == null) {

				WeakReference<HttpSession>[] ccs = getHttpSessions(req,
						req.getSession(), false);
				if (ccs != null && ccs[0] != null) {
					HttpSession savedSess = ccs[0].get();
					if (savedSess != null) {
						currentSession.setAttribute(SESSION_ATT_NAME,
								savedSess.getAttribute(SESSION_ATT_NAME));
						loggedIn = true;
						saveSessionToServletContext(req);
					}
				}
			}
			removeDeadEntries(req);

		} catch (IllegalStateException e) {
			// happens if a session was already invalidated
			e.printStackTrace();
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

		HttpSession session = req.getSession();

		WeakReference<HttpSession>[] ccs = getHttpSessions(req, session, true);

		if (ccs[0] == null) {
			ccs[0] = new WeakReference<HttpSession>(session);
		} else if (ccs[1] == null) {
			ccs[1] = new WeakReference<HttpSession>(session);
		} else {
			throw new RuntimeException("No free session-storage");
		}

		removeDeadEntries(req);
	}

	/**
	 * Invalidates this session and all other session associated with this
	 * session via the context.
	 * 
	 * @param req
	 */
	public synchronized void invalidateAllSessions(HttpServletRequest req) {
		HttpSession session = req.getSession();
		WeakReference<HttpSession>[] ccs = getHttpSessions(req, session, false);
		if (ccs != null) {
			for (int i = 0; i < 2; i++) {
				if (ccs[i] != null) {
					HttpSession ss = ccs[i].get();
					if (ss != null) {
						try {
							ss.invalidate();
						} catch (IllegalStateException e) {
							e.printStackTrace();
						}
					}
					ccs[i].clear();
					ccs[i] = null;
				}
			}
			ServletContext crossContext = getServletContext(req);
			Map<String, WeakReference<HttpSession>[]> ccsm = getMapFromContext(crossContext);
			ccsm.remove(session.getId());
		}
	}

	@SuppressWarnings("unchecked")
	private WeakReference<HttpSession>[] getHttpSessions(
			HttpServletRequest req, HttpSession session, boolean create) {
		Map<String, WeakReference<HttpSession>[]> ccsm = getSafeMap(req);

		WeakReference<HttpSession>[] ccs = ccsm.get(session.getId());
		if (create && ccs == null) {
			ccs = new WeakReference[2];
			ccsm.put(session.getId(), ccs);
		}
		return ccs;
	}

	private Map<String, WeakReference<HttpSession>[]> getSafeMap(
			HttpServletRequest req) {
		ServletContext crossContext = getServletContext(req);
		Map<String, WeakReference<HttpSession>[]> ccsm = getMapFromContext(crossContext);

		if (ccsm == null) {
			ccsm = new HashMap<String, WeakReference<HttpSession>[]>();
			crossContext.setAttribute(CONTEXT_ATT_NAME, ccsm);
		}
		return ccsm;
	}

	@SuppressWarnings("unchecked")
	private Map<String, WeakReference<HttpSession>[]> getMapFromContext(
			ServletContext crossContext) {
		return (Map<String, WeakReference<HttpSession>[]>) crossContext
				.getAttribute(CONTEXT_ATT_NAME);
	}

	private ServletContext getServletContext(HttpServletRequest req) {
		return req.getSession().getServletContext().getContext(CONTEXT_NAME);
	}

	private void removeDeadEntries(HttpServletRequest req) {

		Map<String, WeakReference<HttpSession>[]> ccsm = getSafeMap(req);

		for (Iterator<Map.Entry<String, WeakReference<HttpSession>[]>> it = ccsm
				.entrySet().iterator(); it.hasNext();) {
			Map.Entry<String, WeakReference<HttpSession>[]> en = it.next();
			WeakReference<HttpSession>[] sessions = en.getValue();

			if (sessions[1] != null) {
				if (sessions[1].get() == null) {
					sessions[1] = null;
				}
			}
			if (sessions[0] != null) {
				if (sessions[0].get() == null) {
					sessions[0] = null;
				}
			}
			if (sessions[1] != null && sessions[0] == null) {
				sessions[0] = sessions[1];
				sessions[1] = null;
			} else if (sessions[0] == null && sessions[1] == null) {
				it.remove();
			}
		}
	}
}
