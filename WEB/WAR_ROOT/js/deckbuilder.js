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
core_data.getCard = function(cardId) {
	if(typeof(this.idCardCache) === 'undefined') {
		this.idCardCache = {}
		var icc = this.idCardCache;
		$.each([this.Dark,this.Light], function() {
			$.each(this.CardBlocks, function() {
				$.each(this.cards, function() {
					icc["card"+this.id] = this;
				});
			});
		});
	}
	return this.idCardCache[cardId];
}

String.prototype.toObject = function(rowSep, colSep) {
	var retObj = {};
	$.each(this.split(rowSep), function() {
		if(this.length > 0){
			var key = this.substring(0,this.indexOf(colSep))
			var value = this.substring(this.indexOf(colSep)+1)
			retObj[key] = value.trim();
		}
	});	
	return retObj;
}

function Cards() {

	this.onlyOnce = [35,36,17,18]
	this.affiliationRestrictions = [
		{affi:'Sith',blockNo:22},
		{affi:'Imperial Navy',blockNo:28},
		{affi:'Jedi',blockNo:4},
		{affi:'Rebel Alliance',blockNo:13}
	];

	this.reset(false);
}

Cards.prototype.askForReset = function() {		
	var self = this;
	$('<div style="padding: 10px; max-width: 500px; word-wrap: break-word;">Do you really want to discard this deck?</div>').dialog({
	    draggable: false,
	    modal: true,
	    resizable: false,
	    width: 'auto',
	    title: 'Discard current deck',
	    minHeight: 75,
        close: function(ev, ui) {
			$(this).remove();
		},
	    buttons: {
	        OK: function () {
	        	self.createSide('reset');
	            $(this).dialog('destroy');
	        },
	        Cancel: function () {           
	            $(this).dialog('destroy');
	        }
	    }
	});
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
	this.combatIcons = {
		add : function(combatIconsToAdd) {
			var self = this;
			$.each(combatIconsToAdd, function(key, val) {
				var varInt = parseInt(val);
				if(varInt>0) {
					if(typeof(self[key]) == 'undefined') {
						self[key] = 0;
					}
					self[key] += varInt;
				}
			})			
		}
	}
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

				var combatIcons = this["Combat Icons"].toObject(',',':')
				self.combatIcons.add(combatIcons)
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
	$("#main input[type=radio]").each(function() {
		if(this.checked) { 
			self.affilication = this.value;
		}
	});
	this.cardBlocks = [];
	$("#main input[type=checkbox]").each(function() {
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
		$("#out").html("Deck not ready to download"); 
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
	var combatIconsStr = "";
	$.each(this.combatIcons, function(key, value) {
		if(typeof(value)=='number') {
			if(combatIconsStr.length>0) combatIconsStr += ", ";
			combatIconsStr += key+"="+value+" (ø:"+(value/(self.cardBlocks.length*5)).toFixed(2)+"%)";
		}
	})
	$('#statisticsDiv').html("Sets selected: "+this.cardBlocks.length+" / "+"Cards: "+this.totalNumCards+"<br/>"+
						"Cost: "+this.totalCost+" (ø:"+(this.totalCost/this.totalCostCards).toFixed(2)+")<br/>"+
						"Force: "+this.totalForce+" (ø:"+(this.totalForce/(this.cardBlocks.length*5)).toFixed(2)+")<br/>"+
						"Obj Resources: "+(this.totalAffiliationResources+this.totalObjectiveResources)+" (ø:"+(this.totalObjectiveResources/this.cardBlocks.length).toFixed(2)+")<br/>"+
						"Oth Resources: "+this.totalNonObjectiveResources+" (ø:"+(this.totalNonObjectiveResources/(this.cardBlocks.length*5)).toFixed(2)+")<br/>"+
						"Unit Dmg Capa: "+this.totalUnitDmgCapacity+" (ø:"+(this.totalUnitDmgCapacity/this.totalUnitCards).toFixed(2)+")<br/>"+						
						"Types: "+typesStr+"<br/>"+
						"Affiliation: "+affiliationStr+"<br/>"+
						"Combat Icons: "+combatIconsStr+"<br/>"
						);
	var allselectedBlocks = "";
	var lastBlockNo = "";
	$.each(this.cardBlocks, function() {		
		var blockNo = parseInt(this.toString());
		if(lastBlockNo != blockNo) {
			if(allselectedBlocks != "") {
				allselectedBlocks += "<br/>"
			}
			var cards = core_data.getBlock(blockNo)		
			allselectedBlocks += "<a href='#block_"+blockNo+"'>"+cards[0].name+"</a>";
		} else {
			allselectedBlocks += " (2x)";
		}
		lastBlockNo = blockNo
	})
	$('#selectedCardsDiv').html(allselectedBlocks);
}

Cards.prototype.selectionChanged = function() {
	this.updateSelectionModel(); // UI selection -> data model
	this.restrictSelections(); // update UI related to restrictions
	this.changeShow()
	this.updateSelectionModel(); // UI selection -> data model since it could be that we removed something
	this.calcStatistics();
	this.updateUi();
}

Cards.prototype.changeShow = function () {
	var self = this
	var showSelected = $("#cardsDiv input[type=radio]:checked").val()
	var unitsSelected = {
		Un : $("#cardsDiv input[name=show_unit]:checked").val()?true:false,
		En : $("#cardsDiv input[name=show_enhancement]:checked").val()?true:false,
		Ev : $("#cardsDiv input[name=show_event]:checked").val()?true:false,
		Fa : $("#cardsDiv input[name=show_fate]:checked").val()?true:false,
		Ob : $("#cardsDiv input[name=show_objective]:checked").val()?true:false
	}
	var setsSelected = {
		"Core" : $("#cardsDiv input[name=set_core]:checked").val()?true:false,
		"Desolation-Of-Hoth" : $("#cardsDiv input[name=set_Desolation-Of-Hoth]:checked").val()?true:false
	}
	$("div[class=cardBox] img").each(function() {
		var card = core_data.getCard(this.id)		
		var showSelection = showSelected == 'all' || 
			showSelected == 'sel' && $.inArray((parseInt(card.Block,10)).toString(), self.cardBlocks) != -1 || 
			showSelected == 'not' && $.inArray((parseInt(card.Block,10)).toString(), self.cardBlocks) == -1;;		
		if(unitsSelected[card.Type.substring(0,2)] && setsSelected[card.set] && showSelection) {
			$(this).show()
		} else {
			$(this).hide()
		}
	});
}

Cards.prototype.createSide = function (side) {
	this.side = side;
	if(side=='reset') {
		$('#mainLinkReset').hide();
		$('#mainLinkLight').show();
		$('#mainLinkDark').show();
		$('#main').empty();
		this.reset(true);
		$('#statisticsDiv').empty();
		if(user.loggedIn) {
			$('#mainLinkLoad').show();
			$('#mainLinkSave').hide();
			$('#mainLinkSaveAs').hide();
		}
	} else {
		$('#mainLinkLight').hide();
		$('#mainLinkDark').hide();
		$('#mainLinkReset').show();
		$('#main').empty()
		this.reset(false);
		this.updateUi();
		if(user.loggedIn) {
			$('#mainLinkLoad').hide();
			$('#mainLinkSave').show();
			$('#mainLinkSaveAs').show();
		}

		// create Affiliations-Box
		var mainDiv = $("<div />").attr('class','affiBox');
		$("<div />").html("Affiliations for "+side).appendTo(mainDiv);
		$.each(core_data[side].Affiliation, function(index, value) {
			$("<input />").attr('type','radio').attr('name','affi').attr('value',value.name).attr('onchange','cards.selectionChanged()').appendTo(mainDiv);
			$("<img />").attr('src',user.path+'/'+value.fileName).appendTo(mainDiv);
		});
		$('#main').append(mainDiv);

		// create all Card-Boxs
		$.each(core_data[side].CardBlocks, function(index, value) {
			var mainDiv = $("<div />").attr('class','cardBox');
			var headerAhref = $("<a />").attr("name","block_"+value.blockNo).html("Block "+value.blockNo);
			var headerDiv = $("<div />").append(headerAhref);
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
				$("<img />").attr('id','card'+value.id).attr('src',user.path+'/'+value.fileName).appendTo(toAppendDiv);
			});
			$('#main').append(mainDiv);
		});
		this.updateSelectionModel();
		this.restrictSelections();
	}
}

function User() {
	this.deckList = [];
	this.path = "tmp"
	this.loggedIn = false
}

// jQuery's inArray uses === but I need ==
Cards.inArray = function(objToSearch, array, index) {
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
		if(Cards.inArray(this.name, cardBlocks, lastFound)!=-1) {
			lastFound=Cards.inArray(this.name, cardBlocks, lastFound)+1;
			this.checked = true;
		}
	});
}

User.prototype.saveDeck = function() {	
	var self = this;
	if(cards.currentDeckId == "") {
		this.saveAsDeck();
	} else {
		$.get( "api.groovy" , {
			type:'save',
			deckId: cards.currentDeckId, 
			affi: cards.affilication, 
			blocks: cards.cardBlocks.join('-'),
			valid: (cards.affilication!='none' && cards.cardBlocks.length >= 10)
		}, function(data, textStatus, jqXHR) {
			if(textStatus=='success') {				
				var jsonData = $.parseJSON(data)
				self.deckList = jsonData.deckNames;		
			}
		});		                	
	}
}

User.prototype.saveAsDeck = function() {	
	var self = this;
	$( 	'<div>'+
  		'<p>Please enter a name for the deck:</p>'+
  		'<input type="text" id="textDeckName" name="textDeckName" />'+
		'</div>' ).dialog({     
			modal: true,                   
            title: 'Save deck',
            close: function(ev, ui) {
				$(this).remove();
  			},
            buttons: {
                "Save deck": function () { 
                	var textDeckName = $("#textDeckName").val()						
					$.get( "api.groovy" , {
						type:'save', 
						deckName: textDeckName, 
						side: cards.side, 
						affi: cards.affilication, 
						blocks: cards.cardBlocks.join('-'),
						valid: (cards.affilication!='none' && cards.cardBlocks.length >= 10)
					}, function(data, textStatus, jqXHR) {
							if(textStatus=='success') {
								var jsonData = $.parseJSON(data)
								self.deckList.push(jsonData)
								cards.currentDeckId = jsonData.id
							}
						}
					);		                	
                	$( this ).dialog( "destroy" )
                }
            }
        });
}

User.prototype.delDeck = function(deckId) {
	var self = this;
	$.ajax( "api.groovy" , {type: 'GET', dataType: 'json', data: {type:'delete',deckId:deckId}, 
		success: function(data, textStatus, jqXHR) {
			if(textStatus=='success') {
       			self.deckList = data.deckNames;
			}
		}
	});
	this.dialog.dialog("destroy");
}

User.prototype.loadDeck = function(deckId) {
	var self = this;
	$.ajax( "api.groovy" , {type: 'GET', dataType: 'json', data: {type:'load',deckId:deckId}, 
		success: function(data, textStatus, jqXHR) {
			if(textStatus=='success') {
				cards.createSide(data.side);
				cards.reverseUpdateSelectionModel(data.affiliation, data.blocks.split("-"));
				cards.selectionChanged();
				cards.currentDeckId = deckId
			}
		}
	});
	this.dialog.dialog("destroy");
}

User.prototype.showDeckList = function() {
	var str = "";
	$.each(this.deckList, function() {
		str += "<a href='javascript:void(0)' onclick='user.delDeck(\""+this.id
			+"\")'>[Del]</a> <a href='javascript:void(0)' onclick='user.loadDeck(\""+this.id+"\")'>"
			+this.name+" ("+this.side+"/"+(this.valid=='true'?"Valid":"Invalid")+")"+"</a><br/>";
	});
	this.dialog = $( 	'<div>'+str+'</div>' ).dialog({ 
		title:'Load a deck',
		modal:true,
		width: 500,
		buttons: { "Cancel": function() { $( this ).dialog( "destroy" ); } },
        close: function(ev, ui) {
			$(this).remove();
		},
    	open: function ()
		{
			$(this).parents().find('button').last().focus(); 
		},
	});
}

User.prototype.register = function() {
	var self = this;
	$( 	'<div>'+
  		'<p>Please enter your email and a passwort to create a new account:</p>'+
  		'Email:<br/><input type="text" id="textEmail" name="email" /><br/>'+
  		'Password:<br/><input type="text" id="textPassword" name="password" />'+
		'</div>' ).dialog({     
			modal: true,                   
            title: 'Register account',
	        close: function(ev, ui) {
				$(this).remove();
			},
            buttons: {
                "Create account": function () { 
                	if($("#textEmail").val() == "" || $("#textPassword").val() == "") {
                		alert("Empty email and/or passwords are not allowed!");
                		return;
                	} else {
		            	$.ajax( "api.groovy" , {
		            		type: 'POST',
		            		dataType: 'json',
		            		headers: { "cache-control": "no-cache" },
		            		data: {type:'create',email:$("#textEmail").val(), pass:$("#textPassword").val()} ,
		            		success : function(data, textStatus, jqXHR) {
		                		if(textStatus=='success') {
                        			$('#mainLinkLogin').hide();
                        			$('#mainLinkRegister').hide();                            			
		                			$('#mainLinkLogout').show();                            			
                        			self.deckList = data.deckNames;
                        			self.loggedIn = true
				        			if(cards.side==null||cards.side=='reset') {
				       					$('#mainLinkLoad').show();
				       				} else {
				       					$('#mainLinkSave').show();
				       					$('#mainLinkSaveAs').show();
				       				}
		                		}
		                	},
							error : function(jqXHR, textStatus, errorThrown) {
	                			alert(jqXHR.getAllResponseHeaders().toObject("\r\n",':').X_ERROR);
		                	}
		            	});
                    	$( this ).dialog( "destroy" ); 
                	}                            	
               	},
               	"Cancel": function() {
               		$( this ).dialog( "destroy" ); 
               	}
            }
        });	
}

User.prototype.logout = function() {
	deleteCookie("JSESSIONID")
	$('#mainLinkLogin').show();
	$('#mainLinkRegister').show();                            			
	this.deckList = [];
	this.path = "tmp";
	this.loggedIn = false
	$('#mainLinkLoad').hide();
	$('#mainLinkSave').hide();
	$('#mainLinkSaveAs').hide();
	$('#mainLinkLogout').hide();
}

User.prototype.login = function() {
	var self = this;
	$( 	'<div>'+
  		'<p>Please enter your email and a passwort to login:</p>'+
  		'Email:<br/><input type="text" id="textEmail" name="email" /><br/>'+
  		'Password:<br/><input type="password" id="textPassword" name="password" />'+
		'</div>' ).dialog({     
			modal: true,                   
	        title: 'Login',
	        close: function(ev, ui) {
				$(this).remove();
			},
	        buttons: {
	            "Login": function () { 
	            	$.ajax( "api.groovy" , {
	            		type: 'POST',
	            		dataType: 'json',
	            		headers: { "cache-control": "no-cache" },
	            		data: { type:'login', email:$("#textEmail").val(), pass:$("#textPassword").val() },
	            		success : function(data, textStatus, jqXHR) {
	                		if(textStatus=='success') {
	                			$('#mainLinkLogin').hide();
	                			$('#mainLinkRegister').hide();                            			
	                			$('#mainLinkLogout').show();                            			
	                			self.deckList = data.deckNames;
	                			self.path = data.path;
	                			self.loggedIn = true
			        			if(cards.side==null||cards.side=='reset') {
			       					$('#mainLinkLoad').show();
			       				} else {
			       					$('#mainLinkSave').show();
			       					$('#mainLinkSaveAs').show();
			       				}
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
	            	$( this ).dialog( "destroy" ); 
	           	},
	           	"Cancel": function() {
	           		$( this ).dialog( "destroy" ); 
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
function deleteCookie(key) {
    document.cookie = encodeURIComponent(key) + "=deleted; expires=" + new Date(0).toUTCString();
}

$(function() {
	$( "#tabs" ).tabs();
	if(readCookie("JSESSIONID")!=null) {
    	$.ajax( "api.groovy" , {
    		type: 'GET',
    		dataType: 'json',    		
    		data: { type:'relogin' },
    		success : function(data, textStatus, jqXHR) {
        		if(textStatus=='success') {
        			$('#mainLinkLogin').hide();
        			$('#mainLinkRegister').hide();      
        			$('#mainLinkLogout').show();                      			        			
        			user.deckList = data.deckNames;
        			user.path = data.path;
        			user.loggedIn = true
        			if(cards.side==null||cards.side=='reset') {
       					$('#mainLinkLoad').show();
       				} else {
       					$('#mainLinkSave').show();
       					$('#mainLinkSaveAs').show();
       				}
        		}
        	}
        });
	}
});





