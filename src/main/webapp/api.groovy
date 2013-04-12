import static groovyx.net.http.ContentType.JSON
import groovyx.net.http.RESTClient

import java.lang.ref.WeakReference
import java.security.MessageDigest
import java.util.HashMap
import java.util.Map
import java.util.Random;

import javax.servlet.*
import javax.servlet.http.HttpSession

import de.oglimmer.bcg.servlet.CrossContextSession

import org.mindrot.jbcrypt.BCrypt

import javax.mail.internet.*
import javax.mail.*
import javax.activation.*

//org.apache.log4j.xml.DOMConfigurator.configure("log4j.xml");

def getRESTClient(){
  return new RESTClient("http://localhost:5984/")
}
def getDBName() {
	return "swlcg/"
}
def safeSession() {
	if (!session) {
	  session = request.getSession(true);
	}
}

def client = getRESTClient()
def builder = new groovy.json.JsonBuilder()

if (params.type=='create') {
	try {
		def hashed = BCrypt.hashpw(params.pass, BCrypt.gensalt(10));
		def response = client.put(path: getDBName() + params.email.toLowerCase(), contentType: JSON, requestContentType:  JSON, body: [password2: hashed, deckList_swlcg: []])
		safeSession()		
		session.email = params.email.toLowerCase()
		CrossContextSession.INSTANCE.saveSessionToServletContext(request)		
		def deckNames = []
		builder (
			[deckNames: deckNames, path: 'tmp']
		)	
	} catch(groovyx.net.http.HttpResponseException e) {
		response.addHeader('X_ERROR',e.getMessage());
		response.sendError(500);
	}
}

if (params.type=='login') {
	try {
		def success = false
		def httpResponse = client.get(path: getDBName() + params.email.toLowerCase(), contentType: JSON, requestContentType:  JSON)
		if(httpResponse.data.password2) {
			success = BCrypt.checkpw(params.pass, httpResponse.data.password2)
		} else {
			def messageDigest = MessageDigest.getInstance("SHA1")
			success = messageDigest.digest(params.pass.bytes) == httpResponse.data.password
		}
		
		if(success) {
			safeSession()
			session.email = params.email.toLowerCase()			
			CrossContextSession.INSTANCE.saveSessionToServletContext(request)	
			def deckNames = httpResponse.data.deckList_swlcg
			builder (
				[deckNames: deckNames, path: (httpResponse.data.picPath?httpResponse.data.picPath:'tmp')]
			)
		} else {
			response.sendError(403);
		}		
	} catch(groovyx.net.http.HttpResponseException e) {
		response.sendError(403);
	}
}

if (params.type=='changePass') {
	try {
		def success = false
		def httpResponse = client.get(path: getDBName() + session.email, contentType: JSON, requestContentType:  JSON)
		if(httpResponse.data.password2) {
			success = BCrypt.checkpw(params.oldPass, httpResponse.data.password2)
		} else {
			def messageDigest = MessageDigest.getInstance("SHA1")
			success = messageDigest.digest(params.oldPass.bytes) == httpResponse.data.password
		}
		
		if(success) {
			httpResponse.data.remove("password");
			def hashed = BCrypt.hashpw(params.newPass, BCrypt.gensalt(10));
			httpResponse.data.password2 = hashed
			client.put(path: getDBName() + session.email, contentType: JSON, requestContentType:  JSON, body: httpResponse.data)
		} else {
			response.sendError(403);
		}
	} catch(groovyx.net.http.HttpResponseException e) {
		response.sendError(403);
	}
}

if (params.type=='recoverPassReq') {
	try {
		def buff = new StringBuilder(32);
		Random RAN = new Random(System.currentTimeMillis());
		for (int i = 0; i < 32; i++) {
			char nextChar= 58;
			while ((nextChar >= 58 && nextChar <= 64)	|| (nextChar >= 91 && nextChar <= 96)) {
				nextChar = (char) (RAN.nextInt(75) + 48);
			}
			buff.append(nextChar);
		}
		def passRecoveryToken = buff.toString();
		def httpResponse = client.get(path: getDBName() + params.email, contentType: JSON, requestContentType:  JSON)
		httpResponse.data.passRecoveryToken = passRecoveryToken
		client.put(path: getDBName() + params.email, contentType: JSON, requestContentType:  JSON, body: httpResponse.data)
		
		System.out.println("Generated pass-recovery url=api.groovy?type=recoverPass&email="+params.email+"&token="+ passRecoveryToken);
		
		Properties mprops = new Properties();
		mprops.setProperty("mail.transport.protocol","smtp");
		mprops.setProperty("mail.host", "localhost");
		mprops.setProperty("mail.smtp.port", "25");		
		Session lSession = Session.getDefaultInstance(mprops,null);
		MimeMessage msg = new MimeMessage(lSession);	
		msg.setRecipients(MimeMessage.RecipientType.TO, new InternetAddress(params.email));
		msg.setFrom(new InternetAddress("no_reply@junta-online.net"));
		msg.setSubject("Request for a new password at swlcg.oglimmer.de");
		msg.setText("Hello,\r\n\r\nyou requested a new password for swlcg.oglimmer.de.\r\n\r\nTo generate a new password click this link: http://swlcg.oglimmer.de/api.groovy?type=recoverPass&email="+params.email+"&token="+ passRecoveryToken+"\r\n\r\nIf you haven't requested a new password, just ignore this email.\r\n")		
		Transport.send(msg);
		
	} catch(groovyx.net.http.HttpResponseException e) {
		response.sendError(403);
	}
}

if (params.type=='recoverPass') {
	try {
		def buff = new StringBuilder(12);
		Random RAN = new Random(System.currentTimeMillis());
		for (int i = 0; i < 12; i++) {
			char nextChar= 58;
			while ((nextChar >= 58 && nextChar <= 64)	|| (nextChar >= 91 && nextChar <= 96)) {
				nextChar = (char) (RAN.nextInt(75) + 48);
			}
			buff.append(nextChar);
		}
		def generatedPass = buff.toString();
		def httpResponse = client.get(path: getDBName() + params.email, contentType: JSON, requestContentType:  JSON)
		if(httpResponse.data.passRecoveryToken == params.token) {
			httpResponse.data.remove("password");
			httpResponse.data.remove("passRecoveryToken");
			def hashed = BCrypt.hashpw(generatedPass, BCrypt.gensalt(10));
			httpResponse.data.password2 = hashed
			client.put(path: getDBName() + params.email, contentType: JSON, requestContentType:  JSON, body: httpResponse.data)
			
			System.out.println("Generated a password for "+params.email+"="+generatedPass);
					
			Properties mprops = new Properties();
			mprops.setProperty("mail.transport.protocol","smtp");
			mprops.setProperty("mail.host", "localhost");
			mprops.setProperty("mail.smtp.port", "25");		
			Session lSession = Session.getDefaultInstance(mprops,null);
			MimeMessage msg = new MimeMessage(lSession);	
			msg.setRecipients(MimeMessage.RecipientType.TO, new InternetAddress(params.email));
			msg.setFrom(new InternetAddress("no_reply@junta-online.net"));
			msg.setSubject("A new password at swlcg.oglimmer.de");
			msg.setText("Hello,\r\n\r\nwe generated a new password for you.\r\n\r\nIt is: "+ generatedPass+"\r\n\r\nYou can login at http://swlcg.oglimmer.de\r\n")		
			Transport.send(msg);
			println "Email sent. You can close this window now."
		return;
		}
	} catch(groovyx.net.http.HttpResponseException e) {
		response.sendError(403);
	}
}

if(params.type=='relogin') {
	safeSession()
	CrossContextSession.INSTANCE.retrieveSessionFromServletContext(request)
	if(session.email != null) {
		def httpResponse = client.get(path: getDBName() + session.email, contentType: JSON, requestContentType:  JSON)		
		def deckNames = httpResponse.data.deckList_swlcg
		builder (
			[deckNames: deckNames, path: (httpResponse.data.picPath?httpResponse.data.picPath:'tmp')]
		)
	} else {
		response.sendError(403);
	}
}

if (params.type=='load') {
	def response = client.get(path: getDBName() + params.deckId, contentType: JSON, requestContentType:  JSON)
	safeSession()
	if(session.email == response.data.owner) {			
		def deckData = [side: response.data.side, affiliation: response.data.affiliation, blocks: response.data.blocks]
		builder (
			deckData
		)
	}
}

if (params.type=='save') {	
	safeSession()
	if(params.deckId) {
		// load deck
		def response = client.get(path: getDBName() + params.deckId , contentType: JSON, requestContentType:  JSON)
		// change dat		
		response.data.affiliation = params.affi
		response.data.blocks = params.blocks
		// write back	
		if(session.email == response.data.owner) {			
			response = client.put(path: getDBName() + params.deckId, contentType: JSON, requestContentType:  JSON, body: response.data)
		}
		// update user
		response = client.get(path: getDBName() + session.email, contentType: JSON, requestContentType:  JSON)		
		def deck = response.data.deckList_swlcg.find { it.id == params.deckId }
		deck.valid = params.valid
		client.put(path: getDBName() + session.email, contentType: JSON, requestContentType:  JSON, body: response.data)
		// return new created deck
		builder (
			[deckNames: response.data.deckList_swlcg, path: (response.data.picPath?response.data.picPath:'tmp')]
		)
	} else {
		def deckData = [owner: session.email, deckName: params.deckName, side: params.side,affiliation: params.affi,blocks:params.blocks ]
		// create deck
		def response = client.post(path: getDBName(), contentType: JSON, requestContentType:  JSON, body: deckData)
		def newId = response.data.id
		// update user
		response = client.get(path: getDBName() + session.email, contentType: JSON, requestContentType:  JSON)
		response.data.deckList_swlcg.push([id: newId, name: params.deckName, side: params.side, valid: params.valid])
		response = client.put(path: getDBName() + session.email, contentType: JSON, requestContentType:  JSON, body: response.data)	
		// return new created deck
		builder (
			[id: newId, name: params.deckName, side: params.side, valid: params.valid]
		)
	}
}

if (params.type=='delete') {
	safeSession()
	// del deck
	try {
		def response = client.get(path: getDBName() + params.deckId, contentType: JSON, requestContentType:  JSON)	
		client.delete(path: getDBName() + params.deckId, query: [rev:response.data._rev])
	} catch(groovyx.net.http.HttpResponseException e) {
		// we don't care, since if the deck object is gone, we still want to remove it from the user
	}
	// update user
	response = client.get(path: getDBName() + session.email, contentType: JSON, requestContentType:  JSON)	
	def deckNames = response.data.deckList_swlcg	
	deckNames = deckNames.findAll { it.id != params.deckId }	
	response.data.deckList_swlcg = deckNames	
	response = client.put(path: getDBName() + session.email, contentType: JSON, requestContentType:  JSON, body: response.data)		
	// return new created deck
	builder (
		[deckNames: deckNames, path: (response.data.picPath?response.data.picPath:'tmp')]
	)
}

if (params.type=='logout') {
	CrossContextSession.INSTANCE.invalidateAllSessions(request)
}

response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

println builder.toPrettyString();
