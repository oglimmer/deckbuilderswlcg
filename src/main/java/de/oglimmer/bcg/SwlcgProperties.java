package de.oglimmer.bcg;

import de.oglimmer.utils.AbstractProperties;

public class SwlcgProperties extends AbstractProperties {

	public static final SwlcgProperties INSTANCE = new SwlcgProperties();

	public SwlcgProperties() {
		super("swlcg.properties");
	}

	public String getDbHost() {
 	   return getJson().getString("db.host");
	}

}