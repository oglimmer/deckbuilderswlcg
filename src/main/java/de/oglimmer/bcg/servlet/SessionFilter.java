package de.oglimmer.bcg.servlet;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

public class SessionFilter implements Filter {
	@Override
	public void init(FilterConfig arg0) throws ServletException {
	}

	@Override
	public void destroy() {
	}

	@Override
	public void doFilter(ServletRequest req, ServletResponse resp,
			FilterChain chain) throws IOException, ServletException {
		HttpServletRequest httpReq = (HttpServletRequest) req;
		HttpServletResponse httpResp = (HttpServletResponse) resp;
		HttpSession session = httpReq.getSession();

		CrossContextSession.INSTANCE.retrieveSessionFromServletContext(httpReq);

		// nasty: the previous call might have invalidated the session
		session = httpReq.getSession();
		if (session.isNew()) {
			String id = session.getId();
			long expireTimestamp = System.currentTimeMillis()
					+ (7 * 24 * 60 * 60 * 1000); // 7 days
			String expireDate = new SimpleDateFormat(
					"EEE, dd-MMM-yyyy HH:mm:ss z").format(new Date(
					expireTimestamp));
			httpResp.setHeader("Set-Cookie", String.format(
					"JSESSIONID=%s;Expires=%s;Path=/", id, expireDate));
		}

		chain.doFilter(req, resp);
	}
}
