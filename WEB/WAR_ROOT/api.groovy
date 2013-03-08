import static groovyx.net.http.ContentType.JSON
import groovyx.net.http.RESTClient
import java.security.MessageDigest

//org.apache.log4j.xml.DOMConfigurator.configure("log4j.xml");

@Grab(group='org.codehaus.groovy.modules.http-builder', module='http-builder', version='0.6')
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
		def messageDigest = MessageDigest.getInstance("SHA1")
		def response = client.put(path: getDBName() + params.email.toLowerCase(), contentType: JSON, requestContentType:  JSON, body: [password: messageDigest.digest(params.pass.bytes), deckList: []])
		safeSession()
		session.loggedIn = true;
		session.email = params.email.toLowerCase()
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
		def messageDigest = MessageDigest.getInstance("SHA1")
		def httpResponse = client.get(path: getDBName() + params.email.toLowerCase(), contentType: JSON, requestContentType:  JSON)
		if(messageDigest.digest(params.pass.bytes) == httpResponse.data.password) {
			safeSession()
			session.loggedIn = true
			session.email = params.email.toLowerCase()
			def deckNames = httpResponse.data.deckList
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

if(params.type=='relogin') {
	safeSession()
	if(session.loggedIn) {
		def httpResponse = client.get(path: getDBName() + session.email, contentType: JSON, requestContentType:  JSON)		
		def deckNames = httpResponse.data.deckList
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
		response.data.affiliation = params.affi
		response.data.blocks = params.blocks	
		if(session.email == response.data.owner) {			
			response = client.put(path: getDBName() + params.deckId, contentType: JSON, requestContentType:  JSON, body: response.data)
		}
	} else {
		def deckData = [owner: session.email, deckName: params.deckName, side: params.side,affiliation: params.affi,blocks:params.blocks ]
		// create deck
		def response = client.post(path: getDBName(), contentType: JSON, requestContentType:  JSON, body: deckData)
		def newId = response.data.id
		// update user
		response = client.get(path: getDBName() + session.email, contentType: JSON, requestContentType:  JSON)
		response.data.deckList.push([id:newId, name:params.deckName, side:params.side])
		response = client.put(path: getDBName() + session.email, contentType: JSON, requestContentType:  JSON, body: response.data)	
		// return new created deck
		builder (
			[id:newId, name:params.deckName]
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
	def deckNames = response.data.deckList	
	deckNames = deckNames.findAll { it.id != params.deckId }	
	response.data.deckList = deckNames	
	response = client.put(path: getDBName() + session.email, contentType: JSON, requestContentType:  JSON, body: response.data)		
	// return new created deck
	builder (
		[deckNames: deckNames, path: (response.data.picPath?response.data.picPath:'tmp')]
	)
}

response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

println builder.toPrettyString();
