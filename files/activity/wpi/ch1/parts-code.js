var answer; //object to store information about the answer
var percentCorrect; //percentage correct
var questionsAnswered; //questions answered so far
var correctAnswers; //the number of correct answers given so far
var partsList; //object that stores information about robot parts
var questionNum; //current question number
var displayingResults; //true if displaying results, false otherwise; used to handle submit/next button and its action

/** START ACTIVITY 
 *  --------------
 *  This function is called when the user launches the activity.
 *  It sets all of the variables to their default values, shows the
 *  activity <div>, and downloads the parts list.
 */
function activity_init()
{
	answer = new Object();
	questionNum = 1;
	percentCorrect = 100;
	questionsAnswered = 0;
	correctAnswers = 0;
	displayingResults = false;
	get_parts_list();
	
	document.getElementById("_activity").style.display = "block";
	document.getElementById("startActivity").style.display = "none";
	write_progress();
	
	window.location.replace("#_activitystart");
}

/** DOWNLOAD PARTS LIST
 *  -------------------
 *  This function retrieves the latest parts list JSON file from
 *  the pauls-tutorials repository and loads it into the partsList object.
 */
function get_parts_list()
{
	var xrq = new XMLHttpRequest();
	var raw;
	
	xrq.responseType = "text";
	xrq.open("GET", "https://raw.githubusercontent.com/hal7df/pauls-tutorials/master/files/activity/wpi/ch1/parts-code.json", true);
	
	xrq.onreadystatechange = function () {
		if (xrq.readyState == 4 && xrq.status == "200")
		{
			raw = xrq.response;
			partsList = JSON.parse(raw);
			generate_question();
		}
	};
	xrq.send(null);
}

/** GENERATE QUESTION
 *  -----------------
 *  This function uses random numbers to assemble
 *  a component using the information found in the
 *  partsList object. The necessary information 
 *  to check the response is then stored in the 
 *  answer object.
 */
function generate_question()
{	
	//** clear the answer object
	for (var member in answer)
		delete answer[member];
	
	var questionDisplay = new Object();
	var chosenComponent;
	var randComponent = Math.floor(Math.random() * partsList.length);
	var objInfo;
	var buf, strbuf;
	var useImg, flag;
	
	//** choose a component
	chosenComponent = partsList[randComponent];

	//** decide whether or not to use an image of the component
	if (getRandomBool())
		useImg = false;
	else
		useImg = true;
	
	//** pull in the elements used to display information about the component
	questionDisplay.img = document.getElementById("componentImage");
	questionDisplay.name = document.getElementById("componentName");
	questionDisplay.info = document.getElementById("componentInfo");
	
	//** initialize information variables
	questionDisplay.info.innerHTML = "";
	objInfo = "";
	answer.init = new Array();
	
	//** use if the component is actually a class of components
	if (chosenComponent.generic)
	{
		//** choose a specific device in the class
		randComponent = Math.floor(Math.random() * chosenComponent.devices.length);
		
		//** use text
		if (!useImg || !chosenComponent.devices[randComponent].img)
		{
			questionDisplay.name.style.display = "block";
			questionDisplay.name.innerHTML = chosenComponent.devices[randComponent].name;
			questionDisplay.img.style.display = "none";
		}
		
		//** use an image
		else
		{
			questionDisplay.img.style.display = "block";
			questionDisplay.img.src = chosenComponent.devices[randComponent].img;
			questionDisplay.name.style.display = "none";
		}
		
		//** if the generic class is an abstract grouping (currently only generic-pwm)
		if (chosenComponent.useDeviceName)
			answer.decl = chosenComponent.devices[randComponent].name;
		//** otherwise
		else
			answer.decl = chosenComponent.name;
	}
	//** if the component is specific
	else
	{
		//** use text
		if (!useImg || !chosenComponent.img)
		{
			questionDisplay.name.style.display = "block";
			questionDisplay.name.innerHTML = chosenComponent.display;
			questionDisplay.img.style.display = "none";
		}
		//** use an image
		else
		{
			questionDisplay.img.style.display = "block";
			questionDisplay.img.src = chosenComponent.img;
			questionDisplay.name.style.display = "none";
		}
		
		answer.decl = chosenComponent.name;
	}
	
	//** if the component does not use any parameters in the constructor
	if (!chosenComponent.params)
	{
		answer.init[0] = "new "+ answer.decl + ';';
		answer.params = false;
	}
	
	//** if the component grabs a currently running instance of the object
	else if (chosenComponent.params == "GetInstance")
	{
		answer.init[0] = answer.decl + "::GetInstance();";
		answer.params = "GetInstance";
	}
	
	//** component uses parameters in the constructor
	else
	{
		//** set up the initialization string
		answer.init[0] = "new " + answer.decl + " (";
		
		//** if there are multiple parameters in the constructor
		if (chosenComponent.params.constructor === Array)
		{
			answer.params = new Array();
			
			for (var x = 0; x < chosenComponent.params.length; x++)
			{
				do
				{
					flag = false;
					
					//** read the parameters into the answer object and write a description string
					buf = read_param(chosenComponent.params[x])
					
					//** ensure that the value doesn't conflict with another port of the same type
					for (var y = x-1; y >= 0; y--)
					{
						if (buf.param.value == answer.params[y].value && chosenComponent.params[x].port == chosenComponent.params[y].port)
							flag = true;
					}
				}while(flag);
				
				//** save parameter information
				answer.params[x] = buf.param;
				
				//** construct the initialization string
				answer.init[0] += buf.param.value;
				
				//** add a comma if this is not the last parameter
				if (x < (chosenComponent.params.length - 1))
					answer.init[0] += ", ";

				//** append initialization info to be displayed on screen
				objInfo += buf.info;
			}
			
			//** close initialization string
			answer.init[0] += ");"
		}
		else
		{
			//** read in parameter
			buf = read_param(chosenComponent.params);
			
			//** save parameter information and construct the initialization string
			answer.params = buf.param;
			answer.init[0] += (buf.param.value + ");");
			
			//** add initialization info to be displayed on screen
			objInfo = buf.info;
		}
	}
	
	//** load extra initialization steps
	if (chosenComponent.extInit != false)
	{		
		//** if there are multiple steps in initialization beyond the constructor
		if (chosenComponent.extInit.constructor === Array)
		{
			answer.extInit = new Array();
		
			for (var x = 0; x < chosenComponent.extInit.length; x++)
			{
				answer.extInit[x] = new Object();
				buf = read_param(chosenComponent.extInit[x].params);
				
				answer.extInit[x].params = buf.param;
				answer.extInit[x].name = chosenComponent.extInit[x].name;
				answer.init[x+1] = (chosenComponent.extInit[x].name + " (" + buf.param.value + ");");
				
				objInfo += buf.info;
			}
		}
		
		//** otherwise
		else
		{
			answer.extInit = new Object();
			buf = read_param(chosenComponent.extInit.params);
			
			answer.extInit.params = buf.param;
			answer.extInit.name = chosenComponent.extInit.name;
			answer.init[1] = (chosenComponent.extInit.name + " (" + buf.param.value + ");");
			
			objInfo += buf.info;
		}
	}
	else
		answer.extInit = false;
	
	//** show initialization info
	questionDisplay.info.innerHTML = objInfo;
}

/** READ PARAMETERS
 *  ---------------
 *  Uses the parameter information stored in the JSON file
 *  to construct a valid parameter.
 */
function read_param (param)
{
	var buf = new Object();
	
	buf.param = new Object();
	
	//** assign a port if the parameter represents a port
	if (param.port != false)
		buf.param.value = getRandomPort(param.port);
	
	//** create a random value otherwise
	else
	{
		if (param.type == "bool")
			buf.param.value = getRandomBool();
		else if (param.type == "float")
			buf.param.value = getRandomFloat(param.range[0], param.range[1], 1);
	}
	
	//** save the type of the parameter
	buf.param.type = param.type;
	
	//** read in information about a default parameter
	buf.param.optional = (param.optional && (buf.param.value == param.optionalValue));
	
	//** construct an information string
	buf.info = "<li>";
	
	if (param.abstractdef)
		buf.info += (param.description + ": ");
	
	if (param.port != "USB" && param.port != false)
		buf.info += (param.port + ' ');
	
	buf.info += (buf.param.value + "</li>");
	
	return buf;
}

/** ACTIVITY CHECK/PROCEED/COMPLETE
 *  -------------------------------
 *  This function is called by the Submit/Next/Retry
 *  button. Based on the state of the activity, this function
 *  determines what needs to be done.
 */
function run_finish_action()
{
	//** hide results
	if (displayingResults)
	{
		//** generate new question
		if (questionNum < 5)
		{
			questionNum++;
			write_progress();
			displayingResults = false;
			
			document.forms["responseform"].reset();
			document.forms["responseform"].style.display = "block";
			document.getElementById("answers").style.display = "none";
			
			document.getElementById("nextAction").innerHTML="Submit";
			generate_question();
			window.location.replace("#_activitystart");
		}
		//** reload page
		else
		{
			window.location.replace("#Activity");
			window.location.reload();
		}
	}
	//** check answer
	else
	{
		var correct;
		correct = check_answer();
		score_answer(correct);
		report_answer(correct);
		write_progress();
		displayingResults = true;
		if (questionNum < 5)
			document.getElementById("nextAction").innerHTML="Next &gt;";
		else
			document.getElementById("nextAction").innerHTML="Retry";
		
		window.location.replace("#_activitystart");
	}
}

/** CHECK ANSWER
 *  ------------
 *  Take the given input and check it.
 */
function check_answer()
{
	var response = new Object();
	var ansDisp = new Object();
	var correct = new Object();
	var buf;
	var param, paramList;
	var pos = new Object();
	
	//** get the response
	response.decl = document.forms["responseform"]["declare"].value;
	response.init = document.forms["responseform"]["init"].value;

	//** get the individual lines of the initialization
	response.init = response.init.split("\n");
	
	//** get all of the answer display elements
	ansDisp.div = document.getElementById("answers");
	ansDisp.decl = document.getElementById("decl_answer");
	ansDisp.init = document.getElementById("init_answer");
	
	correct.decl = true;
	correct.init = new Array();
	correct.alreadyUsed = new Array();
	
	response.decl = response.decl.trim();
	
	for (var x = 0; x < response.init.length; x++)
	{
		response.init[x] = response.init[x].trim();
		if (response.init[x] === "")
		{
			response.init.splice(x,1);
		}
	}
	
	//** begin correcting the declaration ** ------------------------
	
	response.decl = response.decl.trim();
	
	//** if they don't use the right component
	correct.decl = (response.decl.indexOf(answer.decl) == 0);
	
	//** find the object's declared name
	correct.objName = decl_get_obj_name(response.decl);
	
	//** validate the name
	if (correct.objName[0] == '!')
	{
		correct.objName = correct.objName.substr(1);
		correct.decl = false;
		
		if (correct.objName == "")
			correct.objName = "m_foo";
	}
	else if (correct.objName == "")
	{
		correct.objName = "m_foo";
		correct.decl = false;
	}
	
	if (correct.decl)
	{
		//** check to make sure that there are just two keywords
		correct.decl = decl_check_keywords(response.decl);
		
		if (correct.decl)
		{			
			//** ensure that they declared it as a pointer!
			buf = response.decl.substr(answer.decl.length);
			buf = buf.trim();
			
			correct.decl = (buf.indexOf('*') == 0);
			
			//** and, finally, the semicolon.
			if (correct.decl)
			{
				buf = buf.substr(1);
				buf = buf.trim();
				
				correct.decl = (buf.indexOf('*') == -1);
				
				if (correct.decl)
				{
					buf = buf.substr(buf.search("[A-Za-z0-9]"));
					buf = buf.substr(buf.search("[ ;]"));
					buf = buf.trim();
					
					correct.decl = (buf == ';');
					console.log("Semicolon verified",correct.decl);
					console.log("Remaining string:",buf);
				}
			}
		}
	}
	
	// ** begin correcting the initialization ** --------------------
	
	// ** make sure that they begin the initialization with the variable name
	correct.init[0] = (response.init[0].indexOf(correct.objName) == 0);
	
	if (correct.init[0])
	{		
		buf = response.init[0].substr(correct.objName.length);
		buf = buf.trim();
		
		// ** the constructor needs to be called via the assignment operator
		correct.init[0] = (buf.indexOf('=') == 0);
		
		if (correct.init[0])
		{
			buf = buf.substr(1);
			buf = buf.trim();
			
			// ** in case the object is initialized via the GetInstance function
			if (answer.params == "GetInstance")
			{
				// ** order: ObjectName, ::, GetInstance()
				correct.init[0] = (buf.indexOf(answer.decl) == 0);
				
				if (correct.init[0])
				{
					buf = buf.substr(answer.decl.length);
					buf = buf.trim();
					
					correct.init[0] = (buf.indexOf("::") == 0);
					
					if (correct.init[0])
					{
						buf = buf.substr(2);
						buf = buf.trim();
						
						correct.init[0] = (buf.indexOf("GetInstance()") == 0);
					}
				}
			}
			
			// ** otherwise
			else
			{
				correct.init[0] = (buf.indexOf("new") == 0);
				
				if (correct.init[0])
				{
					buf = buf.substr(3);
					buf = buf.trim();
					
					// ** next comes the class name
					correct.init[0] = (buf.indexOf(answer.decl) == 0);
					
					if (correct.init[0])
					{
						buf = buf.substr(answer.decl.length);
						buf = buf.trim();
						
						// ** if there are multiple parameters taken by the constructor
						if (answer.params != false && answer.params.constructor === Array)
						{
							// ** just get the parameter string
							paramList = buf.substring(buf.indexOf('(') + 1, buf.indexOf(')'));
							paramList = paramList.trim();
							
							// ** get an array of the parameters given by the user (in order)
							paramList = paramList.split(',');
							
							if (paramList.length != answer.params.length)
							{
								var optionalCount = 0;
								
								for (var x = 0; x < answer.params.length; x++)
								{
									if (answer.params[x].optional)
										optionalCount++;
								}
								
								correct.init[0] = ((answer.params.length - paramList.length) == optionalCount);
							}
							
							if (correct.init[0])
							{
								var answerOffset = 0;
								for (var x = 0; x < paramList.length; x++)
								{
									paramList[x] = paramList[x].trim();
									
									if (answer.params[x].optional)
										answerOffset++;
									
									if (correct.init[0] && ((x + answerOffset) < answer.params.length))
										correct.init[0] = check_param(paramList[x], answer.params[x + answerOffset]);
								}
							}
						}
						
						// ** otherwise
						else
						{
							// ** decide if parameters are even used
							var skipParentheses;
							
							skipParentheses = (!(answer.params));
							skipParentheses = (skipParentheses || (answer.params.optional && (buf.search("\\(+.+\\)") == -1)));
							
							// ** we can't
							if (!skipParentheses)
							{
								paramList = buf.substring(buf.indexOf('(') + 1, buf.indexOf(')'));
								paramList = paramList.trim();
								
								correct.init[0] = check_param(paramList, answer.params);
							}
						}
					}
				}
			}
			
			// ** don't forget your semicolon!
			if (correct.init[0])
			{
				buf = buf.substr(buf.indexOf(')') + 1);
				buf = buf.trim();
				correct.init[0] = (buf == ';');
			}
		}
	}
	
	// ** multi-step initialization
	if (answer.init.constructor === Array)
	{
		var funcName;
		var chosenFunc;
		var optionalInit = 0;
		
		correct.alreadyUsed = new Array();
		
		// ** make sure that the user has given the appropriate number of initialization steps
		if (response.init.length != answer.init.length)
		{
			if (answer.extInit.constructor === Array)
			{
				for (var x = 0; x < answer.extInit.length; x++)
				{
					if (answer.extInit[x].params.optional)
						optionalInit++;
				}
				
				correct.initMismatch = ((answer.init.length - response.init.length) != optionalInit);
			}
			else
			{
				if (answer.extInit && answer.extInit.params.optional)
					correct.initMismatch = (response.init.length != 1);
				else
					correct.initMismatch = (response.init.length != answer.init.length);
			}
		}
		else
			correct.initMismatch = false;
		
		if (!correct.initMismatch && response.init.length == 1 && response.init[0] === "")
			correct.initMismatch = true;
		
		// ** if the user put in multiple initialization lines and were correct to do so
		if (response.init.length > 1 && answer.extInit)
		{
			// ** parse through all of the initialization lines
			for (var x = 1; x < response.init.length; x++)
			{
				// ** first check if the object's name is there
				correct.init[x] = (response.init[x].indexOf(correct.objName) == 0);
				
				if (correct.init[x])
				{
					buf = response.init[x].substr(correct.objName.length);
					buf = buf.trim();
					
					// ** then check for the arrow operator (because they should be using pointers!)
					correct.init[x] = (buf.indexOf("->") == 0);
					
					if (correct.init[x])
					{
						buf = buf.substr(2);
						buf = buf.trim();
						
						funcName = buf.substring(0, buf.indexOf('('));
						funcName = funcName.trim();
						
						// ** if there are multiple initialization steps to be had
						if (answer.extInit.constructor === Array)
						{
							chosenFunc = -1;
							for (var y = 0; y < answer.extInit.length; y++)
							{
								if (funcName === answer.extInit[y].name)
								{
									if (!(answer.extInit[y].used))
									{
										answer.extInit[y].used = true;
										chosenFunc = y;
									}
									else
									{
										correct.init[x] = false;
										correct.alreadyUsed.push(x);
									}
									
									break;
								}
							}
							
							if (chosenFunc < 0)
								correct.init[x] = false;
							
							if (correct.init[x])
							{
								buf = buf.substr(funcName.length);
								buf = buf.trim();
								
								paramList = buf.substring((buf.indexOf('(') + 1), buf.indexOf(')'));
								paramList = paramList.trim();
								
								correct.init[x] = check_param(paramList, answer.extInit[chosenFunc].params);
							}
						}
						//** otherwise
						else
						{
							correct.init[x] = (funcName === answer.extInit.name);
							
							if (correct.init[x])
							{
								answer.extInit.used = true;
								buf = buf.substr(funcName.length);
								buf = buf.trim();
								
								paramList = buf.substring((buf.indexOf('(') + 1), buf.indexOf(')'));
								paramList = paramList.trim();
								
								correct.init[x] = check_param(paramList, answer.extInit.params);
							}
							else
								answer.extInit.used = false;
						}
					}
					
					if (correct.init[x])
					{
						buf = buf.substr(buf.indexOf(')') + 1);
						buf = buf.trim();
						correct.init[x] = (buf === ';');
					}
				}
			}
		}
	}
	else
		correct.initMismatch = (response.init.length != 1);
	
	return correct;
}

/** CHECK DECLARATION STRING
 *  ------------------------
 *  Checks the string to ensure that the only alphabetic
 *  contents (theoretically) are the type keyword and
 *  the object name.
 *  
 *  @param decl: the declaration string.
 *  @returns whether or not there are only 2 alphabetic keywords
 */
function decl_check_keywords (decl)
{
	var numAlpha;
	
	decl = decl.split(' ');
	
	numAlpha = 0;
	
	for (var x = 0; x < decl.length; x++)
	{
		if (decl[x].search("[A-Za-z0-9_]") != -1)
			numAlpha++;
	}
	
	return numAlpha == 2;
}

/** GET OBJECT NAME
 *  ---------------
 *  Parse a declaration string and get the declared
 *  name of an object. Also validates and corrects the
 *  name if it is illegal
 * 
 * @param decl: the declaration string
 * @returns {String}: the name of the object
 */
function decl_get_obj_name (decl)
{
	var objName;
	var buf;
	var pos;
	var flag;
	
	//** split apart declaration line by spaces
	decl = decl.split(' ');
	
	//** initialize empty object name
	objName = "";
	
	//** find first alpha keyword that isn't the type keyword
	for (var x = 1; x < decl.length; x++)
	{
		if (decl[x].search("[A-Za-z0-9_]") != -1)
		{
			objName = decl[x];
			break;
		}	
	}

	//** weed out illegal characters (hopefully * and ; at the beginning and end)
	pos = objName.search("[^A-Za-z0-9_]");
	flag = false;
	
	while (pos != -1)
	{
		if (pos == (objName.length - 1))
		{
			if (objName.charAt(pos) != ';')
				flag = true;
			
			objName = objName.substr(0, (objName.length - 1));
		}
		else if (pos == 0)
		{
			if (objName.charAt(pos) != '*')
				flag = true;
			
			objName = objName.substr(1);
		}
		else
		{
			buf = objName.substring(0, pos);
			buf.concat(objName.substr(pos+1));
			objName = buf;
			flag = true;
		}
		pos = objName.search("[^A-Za-z0-9_]");
	}
	
	//** make sure the leading character is not numeric
	if (!isNaN(objName.charAt(0)))
	{
		objName = objName.substr(1);
		flag = true;
	}
	
	//** throw a flag in the name in case there were illegal characters
	if (flag)
		objName = "!"+objName;
	
	return objName;
}

/** CHECK A PARAMETER GIVEN BY THE USER
 *  -----------------------------------
 *  Parse the correct data type out of the response
 *  string and check it against the value chosen by the computer.
 * 
 * @param given: the given parameter (String)
 * @param param: the param object associated with this parameter
 * @returns whether or not the parameter is correct
 */
function check_param (given, param)
{
	var parsed;
	var correct;
	
	correct = true;
	
	// ** parse the right data type out of the string
	if (param.type === "int")
	{
		// ** make sure only an integer was given
		correct = (given.search("[^0-9]") == -1);
		
		if (correct)
			parsed = parseInt(given, 10);
	}
	else if (param.type === "float")
	{
		// ** make sure only a float was given
		correct = (given.search("[^0-9.]"));
		
		if (correct)
			parsed = parseFloat(given);
	}
	else if (param.type === "bool")
	{
		// ** make sure that only 'true' or 'false' was given
		correct = (given === "true" || given === "false")
		
		if (correct)
			parsed = (given === "true");
	}
	
	// ** check the parameter
	if (correct)
		correct = (parsed === param.value);
	
	return correct;
}

/** SCORE AN ANSWER
 *  ---------------
 *  Appropriately scores a given response.
 * 
 * @param correct: the correct object generated by check_answer()
 */
function score_answer (correct)
{
	var totalQuestions;

	// ** if they did not provide the correct number of initialization steps, dock points
	if (correct.initMismatch)
		totalQuestions = correct.init.length + 2;
	else
		totalQuestions = correct.init.length + 1;
	
	if (correct.decl)
		correctAnswers += 1;
	
	for (var x = 0; x < correct.init.length; x++)
	{
		if (correct.init[x])
			correctAnswers += 1;
	}
	
	questionsAnswered += totalQuestions
	
	percentCorrect = (correctAnswers / questionsAnswered) * 100;
}

/** REPORT AN ANSWER
 *  ----------------
 *  Displays the results of a response.
 * 
 * @param correct: the correct object generated by check_answer()
 */
function report_answer(correct)
{
	// ** hide the form, show the report
	document.forms["responseform"].style.display = "none";
	
	// ** get the necessary elements
	var declList = document.getElementById("decl_answer");
	var initList = document.getElementById("init_answer");
	var response = new Object();
	var pos = new Object();
	var funcName, funcIndex;
	var unusedFunctions = false;
	var buf;
	
	//** get the response
	response.decl = document.forms["responseform"]["declare"].value;
	response.init = document.forms["responseform"]["init"].value;

	//** get the individual lines of the initialization
	response.init = response.init.split("\n");
	
	for (var x = 0; x < response.init.length; x++)
	{
		response.init[x] = response.init[x].trim();
		if (response.init[x] === "")
		{\
			response.init.splice(x,1);
		}
	}
	
	// ** report the declaration answer
	
	buf = "<li>Your answer: <code>" + response.decl + "</code> ";
	
	// ** write a green checkmark if they are right
	if (correct.decl)
		buf += "<span style='color: #00cc00; font-size: 1.5em;'>&#10004;</span></li>";
	
	// ** write a red X and the correct answer if not
	else
	{
		buf += "<span style='color: #ff0000; font-size: 1.5em;'>&#10008;</span></li>";
		buf += "<li>Correct answer: <code>" + answer.decl + "* " + correct.objName + "&#59;</code></li>";
	}
	
	declList.innerHTML = buf;
	
	// ** report the initialization answers
	
	// ** did they succeed at task #1?
	buf = "<li>Correct number of initialization steps: ";
	if (correct.initMismatch)
		buf += "<span style='color: #ff0000; font-size: 1.5em;'>&#10008;</span></li>";
	else
		buf += "<span style='color: #00cc00; font-size: 1.5em;'>&#10004;</span></li>";
	
	// ** parse through all of the initialization steps
	for (var x = 0; x < correct.init.length; x++)
	{
		buf += "<li>Initialization line " + (x + 1);
		
		if (correct.init[x])
			buf += " <span style='color: #00cc00; font-size: 1.5em;'>&#10004;</span></li><ul>";
		else
			buf += " <span style='color: #ff0000; font-size: 1.5em;'>&#10008;</span></li><ul>";
		
		buf += "<li>Your answer: <code>" + response.init[x] + "</code></li>";
		
		// ** show some sort of correction if it is wrong
		if (!correct.init[x])
		{
			// ** if they already called the function
			if (correct.alreadyUsed.indexOf(x) != -1)
				buf += "<li>You already called this function</li>";
			
			// ** if it is an extra initialization step
			else if (x > 0)
			{
				pos.start = (response.init[x].indexOf("->") + 2);
				pos.end = response.init[x].indexOf('(');
				
				funcName = response.init[x].substring(pos.start, pos.end);
				funcName = funcName.trim;
				
				funcIndex = -1;
				
				if (answer.extInit.constructor === Array)
				{
					for (var y = 0; y < answer.extInit.length; y++)
					{
						if (funcName === answer.extInit[y].name)
						{
							funcIndex = y;
							break;
						}
					}
					
					if (funcIndex == -1)
						buf += "<li>Unknown function (did you misspell it?)</li>";
					else
					{
						buf += "<li>Correct answer: <code>";
						buf += (correct.objName + "->" + answer.init[funcIndex + 1]);
						buf += "</code></li>";
					}
				}
				else
				{
					if (funcName === answer.extInit.name)
					{
						buf += "<li>Correct answer: <code>";
						buf += (correct.objName + "->" + answer.init[1]);
						buf += "</code></li>";
					}
					else
						buf += "<li>Unknown function (did you misspell it?)</li>";
				}
			}
			
			// ** if it is the first initialization step
			else
			{
				buf += "<li>Correct answer: <code>";
				buf += (correct.objName + " = " + answer.init[0]);
				buf += "</code></li>";
			}
		}
		
		buf += "</ul>";
	}
	
	// ** don't forget neglected functions! (I will never forget you...)
	if (answer.extInit.constructor === Array)
	{
		for (var x = 0; x < answer.extInit.length; x++)
		{
			if ((!(answer.extInit[x].used)) && (!(answer.extInit[x].params.optional)))
			{
				if (!unusedFunctions)
				{
					buf += "<li>Uncalled functions</li><ul>";
					unusedFunctions = true;
				}
				buf += "<li><code>" + correct.objName + "->" + answer.init[x+1] + "</li></code>";
			}
		}
		
		if (unusedFunctions)
			buf += "</ul>"
	}
	else if (answer.extInit && response.init.length == 1)
	{
		if (!(answer.extInit.params.optional))
		{
			buf += "<li>Uncalled functions</li><ul><li><code>";
			buf += correct.objName + "->" + answer.init[1] + "</li></code></ul>";
		}
	}
	
	//** if they tried calling functions during initialization when they didn't need to
	if (correct.init.length < response.init.length)
	{
		buf += "<li>Initialization line 2</li><ul><li>";
		buf += "Your answer: <code>" + response.init[1];
		buf += "</code></li>";
		buf += "<li>Unknown function</li></ul>";
	}
	
	initList.innerHTML = buf;
		
	document.getElementById("answers").style.display = "block";
}


/** UPDATE THE PROGRESS INFORMATION
 *  -------------------------------
 *  Writes progress information to the progress indicator.
 */
function write_progress()
{
	var progress; 
	
	progress = questionNum + "/5&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
	progress += "<span style='color: " + calcColor() + ";'>" + percentCorrect.toFixed(1) + "%</span>";
	document.getElementById("progressIndicator").innerHTML = progress;
}

/** CALCULATE COLOR FOR PERCENTAGE CORRECT
 *  --------------------------------------
 * @returns {String}: the color to use for the given percent
 */
function calcColor() 
{
	var percent = percentCorrect * 0.01;
	
	if (percent <= 0.5)
	{		
		var color1 = hexToRGB(0xff0000);
		var color2 = hexToRGB(0xffff00);
		
		percent *= 2;
	}
	else
	{
		var color1 = hexToRGB(0xffff00);
		var color2 = hexToRGB(0x00cc00);
		
		percent = (percent-0.5)*2;
	}
	
	var out = new Object;
	
	out.r = Math.floor(((percent * color2.r) + ((1 - percent) * color1.r)) + 0.5);
	out.g = Math.floor(((percent * color2.g) + ((1 - percent) * color1.g)) + 0.5);
	out.b = Math.floor(((percent * color2.b) + ((1 - percent) * color1.b)) + 0.5);	
	
	return rgbToHex(out);
}

/** HEX COLOR TO RGB OBJECT
 *  -----------------------
 * @param hex: the hex string representing the color
 * @returns {ColorObject}: the object with r, g, and b components
 */

function hexToRGB(hex) {		
	var color = new Object;
	
	color.r = hex >> 16;
	color.g = (hex >> 8) & 0xFF;
	color.b = hex & 0xFF;
	
	color.r = Math.floor(color.r+0.5);
	color.g = Math.floor(color.g+0.5);
	color.b = Math.floor(color.b+0.5);
	
	return color;
}

/** RGB OBJECT TO HEX COLOR
 * 
 * @param rgb: the rgb object
 * @returns {String}: the hex string representing the color
 */

function rgbToHex(rgb) {
	return "#" + componentToHex(rgb.r) + componentToHex(rgb.g) + componentToHex(rgb.b); 
}

/** CONVERT COMPONENT VALUE TO A HEX STRING
 * 
 * @param c: the component
 * @returns a hex halue representing the component
 */

function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

/** GET RANDOM PORT
 *  ---------------
 *  Generates a random port number.
 *  
 * @param port: the type of port to generate a random port for.
 * @returns a random port number according to port limitations on the roboRIO.
 */
function getRandomPort (port)
{
	if (port == "PWM" || port == "DIO")
		return getRandomInt(0,9);
	else if (port == "Relay" || port == "Analog" || port == "USB")
		return getRandomInt(0,3);
	else if (port == "Solenoid")
		return getRandomInt(0,7);
	else if (port == "CAN")
	{
		if ((Math.floor(Math.random() + 0.5)) == 0)
				return 0;
		else
			return getRandomInt (1,62);
	}
}

/** GET RANDOM BOOL
 *  ---------------
 * @returns ... a random bool
 */
function getRandomBool ()
{
	return (Math.floor(Math.random() + 0.5) == 1);
}

/** GET RANDOM INT
 *  --------------
 * @param lower: the lower boundary of the range to generate numbers in.
 * @param upper: the upper boundary of the range to generate numbers in.
 * @returns ... a random int
 */
function getRandomInt (lower,upper)
{
	return (Math.floor(Math.random() * ((upper - lower) + 0.5)) + lower);
}

/** GET RANDOM FLOAT
 *  ----------------
 * @param lower: the lower boundary of the range to generate numbers in.
 * @param upper: the upper boundary of the range to generate numbers in.
 * @param precision: decimal places to generate numbers to.
 * @returns ... a random float
 */
function getRandomFloat (lower,upper,precision)
{
	var num;
	num = ((Math.random() * (upper - lower)) + lower);
	
	return parseFloat(num.toFixed(precision));
}