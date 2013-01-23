core_data.getBlock = function(blockNo) {
	var retCardList;
	$.each([this.Dark,this.Light], function() {
		$.each(this.CardBlocks, function() {
			if(this.blockNo == blockNo) {
				retCardList = this.cards;
			}
		});
	});
	return retCardList;
}

function Cards() {

	this.onlyOnce = [35,36,17,18]
	this.affiliationRestrictions = [
		{affi:'Sith',blockNo:22},
		{affi:'Imperial Navy',blockNo:28},
		{affi:'Jedi',blockNo:4},
		{affi:'Rebel Alliance',blockNo:13}
	];

	this.reset();
}

Cards.prototype.reset = function() {
	this.currentDeckId = "";
	this.affilication = "none";
	this.cardBlocks = [];
	this.resetStatistics();
	this.updateUi();
}

Cards.prototype.resetStatistics = function() {
	this.totalCost = 0;
	this.totalForce = 0;
	this.totalObjectiveResources = 0;
	this.totalNonObjectiveResources = 0;
	this.totalUnitDmgCapacity = 0;	
	this.totalObjectiveResources = 0;
	this.totalAffiliationResources = this.affilication!='none'?1:0;
	this.totalNumCards = 0;
	this.totalCostCards = 0;
	this.totalUnitCards = 0;
	this.typesCounter = {};
	this.affiliatonCounter = {};
}

Cards.prototype.restrictSelections = function() {
	var self = this;
	$.each(this.affiliationRestrictions, function() {
		var affiliationRestriction = this;
		$("input[type=checkbox]").each(function() {
			if(affiliationRestriction.blockNo == this.name) {
				if(affiliationRestriction.affi == self.affilication) {
					this.disabled = false;
				} else {				
					this.checked = false;
					this.disabled = true;
				}
			}
		});
	});
}

Cards.prototype.calcStatistics = function() {
	this.resetStatistics();	
	var self = this;
	$.each(this.cardBlocks, function() {
		var cardArray = core_data.getBlock(this);
		$.each(cardArray, function() {
			self.totalCost += parseInt(this.Cost);
			self.totalForce += parseInt(this.Force);

			if(this.Type == 'Objective') {
				self.totalObjectiveResources += parseInt(this.Resources);
			} else {
				self.totalNonObjectiveResources += parseInt(this.Resources);
			}

			self.totalNumCards++;
			if(this.Type != 'Fate' && this.Type != 'Objective') {
				self.totalCostCards++;
			}
			if(this.Type == 'Unit') {
				self.totalUnitDmgCapacity += parseInt(this["Damage Capacity"]);
				self.totalUnitCards++;
			}

			if(this.Type != 'Objective') {
				if(typeof(self.typesCounter[this.Type]) == 'undefined') {
					self.typesCounter[this.Type] = 0;
				}
				self.typesCounter[this.Type]++;
			}

			if(typeof(self.affiliatonCounter[this.Affiliation]) == 'undefined') {
				self.affiliatonCounter[this.Affiliation] = 0;
			}
			self.affiliatonCounter[this.Affiliation]++;			
		})
	});	
}

Cards.prototype.updateSelectionModel = function() {
	var self = this;
	$("input[type=radio]").each(function() {
		if(this.checked) { 
			self.affilication = this.value;
		}
	});
	this.cardBlocks = [];
	$("input[type=checkbox]").each(function() {
		if(this.checked) {
			self.cardBlocks.push(this.name);
		}
	});
}

Cards.prototype.updateUi = function() {
	var self = this;
	var buff = '/gen.groovy?affi='+this.affilication+'&cards='+this.cardBlocks.toString();
	if(this.affilication!='none'&&this.cardBlocks.length>=10) {
		$("#out").html("<a href='"+buff+"'>Download your deck</a>"); 
	} else {
		$("#out").html("Deck not ready"); 
	}
	var typesStr = "";
	$.each(this.typesCounter, function(key, value) {
		if(typesStr.length>0) typesStr += ", ";
		typesStr += key.substring(0,2)+"="+value+" ("+Math.round(100*value/(self.cardBlocks.length*5))+"%)";
	})
	var affiliationStr = "";
	$.each(this.affiliatonCounter, function(key, value) {
		if(affiliationStr.length>0) affiliationStr += ", ";
		affiliationStr += key.substring(0,2)+"="+value+" ("+Math.round(100*value/(self.cardBlocks.length*6))+"%)";
	})
	$('#selected').html("Sets selected: "+this.cardBlocks.length+"<br/>"+
						"Cost: "+this.totalCost+" (ø:"+(this.totalCost/this.totalCostCards).toFixed(2)+")<br/>"+
						"Force: "+this.totalForce+" (ø:"+(this.totalForce/(this.cardBlocks.length*5)).toFixed(2)+")<br/>"+
						"Obj Resources: "+(this.totalAffiliationResources+this.totalObjectiveResources)+" (ø:"+(this.totalObjectiveResources/this.cardBlocks.length).toFixed(2)+")<br/>"+
						"Oth Resources: "+this.totalNonObjectiveResources+" (ø:"+(this.totalNonObjectiveResources/(this.cardBlocks.length*5)).toFixed(2)+")<br/>"+
						"Unit Dmg Capa: "+this.totalUnitDmgCapacity+" (ø:"+(this.totalUnitDmgCapacity/this.totalUnitCards).toFixed(2)+")<br/>"+
						"Cards: "+this.totalNumCards+"<br/>"+
						"Types: "+typesStr+"<br/>"+
						"Affiliation: "+affiliationStr+"<br/>"
						);	
}

Cards.prototype.selectionChanged = function() {
	this.updateSelectionModel();
	this.restrictSelections();
	this.calcStatistics();
	this.updateUi();
}

Cards.prototype.createSide = function (side) {
	this.side = side;
	if(side=='reset') {
		$('#mainLinkReset').hide();
		$('#mainLinkLight').show();
		$('#mainLinkDark').show();
		$('#main').empty();
		this.reset();
		$('#selected').empty();
		$('#mainLinkLoad').show();
		$('#mainLinkSave').hide();
	} else {
		$('#mainLinkLight').hide();
		$('#mainLinkDark').hide();
		$('#mainLinkReset').show();
		$('#main').empty()
		this.reset();
		this.updateUi();
		$('#mainLinkLoad').hide();
		$('#mainLinkSave').show();

		// create Affiliations-Box
		var mainDiv = $("<div />").attr('class','affiBox');
		$("<div />").html("Affiliations for "+side).appendTo(mainDiv);
		$.each(core_data[side].Affiliation, function(index, value) {
			$("<input />").attr('type','radio').attr('name','affi').attr('value',value.name).attr('onchange','cards.selectionChanged()').appendTo(mainDiv);
			$("<img />").attr('src','tmp/'+value.fileName).appendTo(mainDiv);
		});
		$('#main').append(mainDiv);

		// create all Card-Boxs
		$.each(core_data[side].CardBlocks, function(index, value) {
			var mainDiv = $("<div />").attr('class','cardBox');
			var headerDiv = $("<div />").html("Block "+value.blockNo+" ")
			headerDiv.appendTo(mainDiv);
			$("<input />").attr('type','checkbox').attr('name',value.blockNo).attr('onchange','cards.selectionChanged()').appendTo(headerDiv);
			if($.inArray(value.blockNo, cards.onlyOnce)==-1) {
				$("<input />").attr('type','checkbox').attr('name',value.blockNo).attr('onchange','cards.selectionChanged()').appendTo(headerDiv);
			}
			$.each(value.cards, function(index, value) {
				var toAppendDiv = mainDiv;
				if(index == 0) {
					toAppendDiv = $("<div />").appendTo(mainDiv);
				}
				$("<img />").attr('src','tmp/'+value.fileName).appendTo(toAppendDiv);
			});
			$('#main').append(mainDiv);
		});
		this.updateSelectionModel();
		this.restrictSelections();
	}
}

function User() {
	this.deckList = [];	
}

// jQuery's inArray uses === but I need ==
Cards.prototype.inArray = function(objToSearch, array, index) {
	for(var i = index ; i < array.length ; i++) {
		if(array[i] == objToSearch) {
			return i;
		}
	}
	return -1;
}

Cards.prototype.reverseUpdateSelectionModel = function(affilication, cardBlocks) {
	var self = this;
	$("input[type=radio]").each(function() {
		if(affilication == this.value) {
			this.checked = true;
		}
	});
	var lastFound = 0;
	$("input[type=checkbox]").each(function() {		
		if(self.inArray(this.name, cardBlocks, lastFound)!=-1) {
			lastFound=self.inArray(this.name, cardBlocks, lastFound)+1;
			this.checked = true;
		}
	});
}

User.prototype.saveDeck = function() {	
	var self = this;
	if(cards.currentDeckId == "") {
		$( 	'<div>'+
	  		'<p>Please enter a name for the deck:</p>'+
	  		'<input type="text" id="textDeckName" name="deckName" />'+
			'</div>' ).dialog({     
				modal: true,                   
	            title: 'Save deck',
	            buttons: {
	                "Save deck": function () { 
	                	var deckName = $("#textDeckName").val()						
						$.get( "api.groovy" , {type:'save', deckName: deckName, side: cards.side, affi: cards.affilication, blocks: cards.cardBlocks.join('-')} , 
							function(data, textStatus, jqXHR) {
								if(textStatus=='success') {
									var jsonData = $.parseJSON(data)
									self.deckList.push(jsonData)
									cards.currentDeckId = jsonData.id
								}
							}
						);		                	
	                	$( this ).dialog( "close" )
	                }
	            }
	        });
	} else {
		$.get( "api.groovy" , {type:'save', deckId: cards.currentDeckId, affi: cards.affilication, blocks: cards.cardBlocks.join('-')} );		                	
	}
}

User.prototype.loadDeck = function(deckId) {
	var self = this;
	$.get( "api.groovy" , {type:'load',deckId:deckId} , function(data, textStatus, jqXHR) {
		if(textStatus=='success') {
			var jsonData = $.parseJSON(data);			
			cards.createSide(jsonData.side);
			cards.reverseUpdateSelectionModel(jsonData.affiliation, jsonData.blocks.split("-"));
			cards.selectionChanged();
			cards.currentDeckId = deckId
		}
	});
	this.dialog.dialog("close");
}

User.prototype.showDeckList = function() {
	var str = "";
	$.each(this.deckList, function() {
		str += "<a href='javascript:void(0)' onclick='user.loadDeck(\""+this.id+"\")'>"+this.name+"</a><br/>";
	});
	this.dialog = $( 	'<div>'+str+'</div>' ).dialog(
		{ title:'Load a deck',modal:true,buttons: { "Cancel": function() { $( this ).dialog( "close" ); } } }
	);
}

User.prototype.register = function() {
	var self = this;
	$( 	'<div>'+
  		'<p>Please enter your email and a passwort to create a new account:</p>'+
  		'Email: <input type="text" id="textEmail" name="email" />'+
  		'Password: <input type="text" id="textPassword" name="password" />'+
		'</div>' ).dialog({     
			modal: true,                   
            title: 'Register account',
            buttons: {
                "Create account": function () { 
                	if($("#textEmail").val() == "" || $("#textPassword").val() == "") {
                		alert("Empty email and/or passwords are not allowed!");
                		return;
                	} else {
		            	$.ajax( "api.groovy" , {
		            		type: 'POST',
		            		dataType: 'json',
		            		data: {type:'create',email:$("#textEmail").val(), pass:$("#textPassword").val()} ,
		            		success : function(data, textStatus, jqXHR) {
		                		if(textStatus=='success') {
                        			$('#mainLinkLogin').hide();
                        			$('#mainLinkRegister').hide();                            			
                        			self.deckList = data;
                       				$('#mainLinkLoad').show();
		                		}
		                	},
							error : function(jqXHR, textStatus, errorThrown) {
								var responseHeaders = {};
								$.each(jqXHR.getAllResponseHeaders().split("\r\n"), function() {
									if(this.length > 0){
										var key = this.substring(0,this.indexOf(':'))
										var value = this.substring(this.indexOf(':')+1)
										responseHeaders[key] = value.trim();
									}
								});											
	                			alert(responseHeaders.X_ERROR);
		                	}
		            	});
                    	$( this ).dialog( "close" ); 
                	}                            	
               	},
               	"Cancel": function() {
               		$( this ).dialog( "close" ); 
               	}
            }
        });	
}

User.prototype.login = function() {
	var self = this;
	$( 	'<div>'+
  		'<p>Please enter your email and a passwort to login:</p>'+
  		'Email: <input type="text" id="textEmail" name="email" />'+
  		'Password: <input type="password" id="textPassword" name="password" />'+
		'</div>' ).dialog({     
			modal: true,                   
	        title: 'Login',
	        buttons: {
	            "Login": function () { 
	            	$.ajax( "api.groovy" , {
	            		type: 'POST',
	            		dataType: 'json',
	            		data: { type:'login', email:$("#textEmail").val(), pass:$("#textPassword").val() },
	            		success : function(data, textStatus, jqXHR) {
	                		if(textStatus=='success') {
	                			$('#mainLinkLogin').hide();
	                			$('#mainLinkRegister').hide();                            			
	                			self.deckList = data;
	               				$('#mainLinkLoad').show();
	                		}
	                	},
						error : function(jqXHR, textStatus, errorThrown) {
							if(errorThrown=='Forbidden') {
	                			alert("Login failed! Wrong email or password!");
	                		} else {
	                			alert(errorThrown);
	                		}
	                	}
	            	});
	            	$( this ).dialog( "close" ); 
	           	},
	           	"Cancel": function() {
	           		$( this ).dialog( "close" ); 
	           	}
	        }
	    });	
}

var user = new User();
var cards = new Cards();

function readCookie(key)
{
    var result;
    return ((result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? (result[1]) : null);
}

$(function() {
	if(readCookie("JSESSIONID")!=null) {
    	$.ajax( "api.groovy" , {
    		type: 'GET',
    		dataType: 'json',
    		data: { type:'relogin' },
    		success : function(data, textStatus, jqXHR) {
        		if(textStatus=='success') {
        			$('#mainLinkLogin').hide();
        			$('#mainLinkRegister').hide();                            			        			
        			user.deckList = data;
       				$('#mainLinkLoad').show();
        		}
        	}
        });
	}
});





