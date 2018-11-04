module.exports = {

  config: {
    Name: "deckbuilderSwlcg",
    Vagrant: {
      Box: 'ubuntu/xenial64',
      Install: 'maven openjdk-8-jdk-headless docker.io'
    },
    Dependencycheck: [
      '[ -f "src/main/webapp/js/core_data.js"  ] || { echo "Private data missing. Abort."; exit 1; }',
    ]
  },

  software: {
    "deckbuilder": {
      Source: "mvn",      
      Artifact: "target/deckbuilder.war"
    },

    "couchdb": {
      Source: "couchdb",
      CouchDB: {
        Schema: "swlcg"
      }
    },

    "tomcat": {
      Source: "tomcat",
      Deploy: "deckbuilder"
    }
  }
}
