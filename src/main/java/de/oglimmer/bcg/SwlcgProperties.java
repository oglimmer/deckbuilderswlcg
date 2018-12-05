package de.oglimmer.bcg;

import de.oglimmer.utils.AbstractProperties;

public class SwlcgProperties extends AbstractProperties {

	public static final SwlcgProperties INSTANCE = new SwlcgProperties();

	public SwlcgProperties() {
		super("swlcg.properties");
	}

	public String getDbProtocol() {
 	   return getJson().getString("db.protocol");
	}

	public String getDbHost() {
 	   return getJson().getString("db.host");
	}

	public String getDbPort() {
 	   return getJson().getString("db.port");
	}

	public String getDbSchema() {
 	   return getJson().getString("db.schema");
	}

	public String getMailProtocol() {
 	   return getJson().getString("mail.protocol");
	}

	public String getMailHost() {
 	   return getJson().getString("mail.host");
	}

	public String getMailPort() {
 	   return getJson().getString("mail.port");
	}

	public String getMailSenderAddress() {
 	   return getJson().getString("mail.senderAddress");
	}

}