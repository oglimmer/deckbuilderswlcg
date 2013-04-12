// this generates a deck file for a given input from command line
def paramAffiliation = params["affi"]
def paramCardBlocks = params["cards"].split(",")

// we read the core.xml file into dataMap (key:blockNr,value:array-of-cards)
def dataMap = [:]
["/Core.xml", "/Desolation-Of-Hoth.xml"].each { refFileDef ->
	def rootNode = new XmlParser().parse(this.getClass().getResourceAsStream(refFileDef))
	rootNode.cards[0].children().each { cardXmlElement ->
		def properties = [:]
		cardXmlElement.children().each {
			properties[it.@name] = it.@value
		}	
		if(properties.Block == "") {
			properties.Block = "0";
		}
		properties.id=cardXmlElement.@id
		properties.name=cardXmlElement.@name
		def blockNr = properties.Block.toInteger();
		if(!dataMap.containsKey(blockNr)) {
			dataMap.put(blockNr, [])
		}
		dataMap.get(blockNr).add(properties)
	}
}

// since a block could be selected more than once, we need to build a map (blockNr->count)
def blockNrMap = [:]
paramCardBlocks.each() { blockNr ->
	def blockNrAsInt = blockNr.toInteger()
	if(!blockNrMap.containsKey(blockNrAsInt)) {
		blockNrMap.put(blockNrAsInt, 1);
	} else {
		blockNrMap.put(blockNrAsInt, blockNrMap[blockNrAsInt] + 1);
	}
}

response.addHeader('Content-Type','application/octet-stream');
response.addHeader('Content-Disposition','attachment; filename=deck.o8d');
response.addHeader('Pragma','no-cache');

html.deck(game:'d5cf89e5-1984-4873-8ae0-f06eea411bb3') {
	section(name:'Affiliation') {
		def cardArray = dataMap[0]
		cardArray.each() { item ->
			if(item.name == paramAffiliation) {
				card(qty:1, id:item.id, item.name)
			}
		}
	}
	section(name:'Command Deck') {
		blockNrMap.each() { blockNr, count ->
			def cardArray = dataMap[blockNr]
			cardArray.each() { item ->
				if(item.Type != "Objective") {
					card(qty:count, id:item.id, item.name)
				}
			}
		}
	}
	section(name:'Objective Deck') {
		blockNrMap.each() { blockNr, count ->
			def cardArray = dataMap[blockNr]
			cardArray.each() { item ->
				if(item.Type == "Objective") {
					card(qty:count, id:item.id, item.name)
				}
			}
		}
	}
}

