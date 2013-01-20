#!/usr/bin/env groovy

import groovy.xml.MarkupBuilder

def basedir = "./"
def file = args[0]

def ant = new AntBuilder();
ant.unzip(  src: basedir+file, dest:basedir+"tmp",  overwrite:"true")
// cd tmp/cards/ &&  mogrify -filter LanczosSharp -resize 50% -format jpg -quality 89 *.jpg && cd ../..

// convert xml to groovy simple data structure (list with maps)
def dataList = []
def rootNode = new XmlParser().parse(new FileInputStream(basedir+"tmp/Core.xml"))
rootNode.cards[0].children().each { cardXmlElement ->
	def properties = [:]
	cardXmlElement.children().each {
		properties[it.@name] = it.@value
	}	
	properties.id=cardXmlElement.@id
	properties.name=cardXmlElement.@name
	dataList.add(properties)
}

// we need to add the image paths
rootNode = new XmlParser().parse(new FileInputStream(basedir+"tmp/_rels/Core.xml.rels"))
rootNode.children().each {
	dataList.each() { card ->
		if( 'C'+card.id.replace('-','') == it.@Id ) {
			card.fileName = it.@Target
		}
	}	
}

// convert list with maps to more complex data structure
def rootData = [
	Dark:[
		Affiliation:[],
		CardBlocks:[]
		],
	Light:[
		Affiliation:[],
		CardBlocks:[]
	]
];
dataList.each() { card ->
	if(card.Type == "Affiliation") {
		rootData[card.Side].Affiliation.add(card);
	} else {
		// group by blocks
		def found = false
		rootData[card.Side].CardBlocks.each { blockEle ->
			if (blockEle.blockNo.toInteger() == card.Block.toInteger()) {
				blockEle.cards.add(card)
				found = true
			}
		}
		if(!found) {
			def blockEle = [blockNo:card.Block.toInteger(), cards:[card]]
			rootData[card.Side].CardBlocks.add(blockEle);
		}
	}
}

// do some sorting
for(def side in rootData) {
	side.value.CardBlocks.sort { it.blockNo }	
	side.value.CardBlocks.each { blockEle ->
		blockEle.cards.sort { it["Block Number"] }
	}
}

// let the JsonBuilder convert the groovy data strucutre into JSON
def builder = new groovy.json.JsonBuilder()
builder (
	rootData
)

new File(basedir+"core_data.js").withWriter { out ->
	out.println "var core_data = ${builder.toPrettyString()}"
}

