#!/usr/bin/env groovy

import groovy.xml.MarkupBuilder

def basedir = "./"

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

args.each { file ->
	
	// def ant = new AntBuilder();
	//  ant.unzip(  src: basedir+file, dest:basedir+"tmp",  overwrite:"true")
	// cd tmp/cards/ &&  mogrify -filter LanczosSharp -resize 50% -format jpg -quality 89 *.jpg && cd ../..
	
//	mogrify -filter LanczosSharp -resize 85x85 -format jpg -quality 89 *.jpg //small
//	mogrify -filter LanczosSharp -resize 509x509 -format jpg -quality 89 *.jpg //large
//	mogrify -filter LanczosSharp -resize 423x423 -format jpg -quality 89 *.jpg //deckbuilder
	
	def xmlDefFile = new File(file)
	if(!xmlDefFile.exists() || !xmlDefFile.isFile() || !file.toString().endsWith(".xml")) {
		System.out.printf("%s is not a xml-file\r\n", file)
		return;
	}
	def baseDir = xmlDefFile.getParentFile()
	def relDefFile = new File(baseDir, "_rels/"+xmlDefFile.getName()+".rels")
	
	System.out.println("Processing "+xmlDefFile)
	//System.out.println("baseDir="+baseDir.getAbsolutePath())
	//System.out.println("relDefFile="+relDefFile.getAbsolutePath())
	
	// convert xml to groovy simple data structure (list with maps)
	def dataList = []
	def rootNode = new XmlParser().parse(new FileInputStream(xmlDefFile))
	rootNode.cards[0].children().each { cardXmlElement ->
		def properties = [:]
		cardXmlElement.children().each {
			properties[it.@name] = it.@value
		}	
		properties.id=cardXmlElement.@id
		properties.name=cardXmlElement.@name
		properties.set=xmlDefFile.getName().substring(0, xmlDefFile.getName().indexOf("."))
		dataList.add(properties)
	}
	
	// we need to add the image paths
	rootNode = new XmlParser().parse(new FileInputStream(relDefFile))
	rootNode.children().each {
		dataList.each() { card ->
			if( 'C'+card.id.replace('-','') == it.@Id ) {
				card.fileName = it.@Target
			}
		}	
	}
	
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
				def setName = xmlDefFile.getName().substring(0, xmlDefFile.getName().indexOf("."))
				def blockEle = [blockNo:card.Block.toInteger(), set:setName, cards:[card]]
				rootData[card.Side].CardBlocks.add(blockEle);
			}
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

