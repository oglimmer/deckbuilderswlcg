module.exports = {

  config: {
    SchemaVersion: "1.0.0",
    Name: "deckbuilderSwlcg",
    Vagrant: {
      Box: 'ubuntu/xenial64',
      Install: 'maven openjdk-8-jdk-headless docker.io'
    },
    Dependencycheck: [
      '[ -f "src/main/webapp/js/core_data.js"  ] || { echo "Private data missing. Abort."; exit 1; }',
    ]
  },

  versions: {
    tomcat: {
      Docker: "tomcat9-openjdk11-openj9"
    }
  },

  software: {
    deckbuilder: {
      Source: "mvn",      
      Artifact: "target/deckbuilder.war",
      config: {
        Name: "lunchy.properties",
        Content: [
          { Line: "{" },
          { Line: "\"db.host\": \"$$VALUE$$\"", Source: "couchdb" },
          { Line: "}" }
        ],
        AttachAsEnvVar: ["JAVA_OPTS", "-Dswlcg.properties=$$SELF_NAME$$"]
      }
    },

    couchdb: {
      Source: "couchdb",
      CouchDB: {
        Schema: "swlcg"
      }
    },

    tomcat: {
      Source: "tomcat",
      DockerImage: "oglimmer/adoptopenjdk-tomcat",
      Deploy: "deckbuilder"
    }
  }
}
