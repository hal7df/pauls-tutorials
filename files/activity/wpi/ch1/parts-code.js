var answer; //object to store information about the answer
var percentCorrect; //percentage correct
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
	percentCorrect = 0;
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
		answer.init = "new "+ answer.decl + ';';
	
	//** if the component grabs a currently running instance of the object
	else if (chosenComponent.params == "GetInstance")
		answer.init = answer.decl + "::GetInstance();";
	
	//** component uses parameters in the constructor
	else
	{
		//** set up the initialization string
		answer.init = "new " + answer.decl + " (";
		
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
				answer.init += buf.param.value;
				
				//** add a comma if this is not the last parameter
				if (x < (chosenComponent.params.length - 1))
					answer.init += ", ";

				//** append initialization info to be displayed on screen
				objInfo += buf.info;
			}
			
			//** close initialization string
			answer.init += ");"
		}
		else
		{
			//** read in parameter
			buf = read_param(chosenComponent.params);
			
			//** save parameter information and construct the initialization string
			answer.params = buf.param;
			answer.init += (buf.param.value + ");");
			
			//** add initialization info to be displayed on screen
			objInfo = buf.info;
		}
	}
	
	//** load extra initialization steps
	if (chosenComponent.extInit != false)
	{
		strbuf = answer.init;
		answer.init = new Array();
		answer.init[0] = strbuf;
		
		//** if there are multiple steps in initialization beyond the constructor
		if (chosenComponent.extInit.constructor === Array)
		{
			answer.extInit = new Array();
		
			for (var x = 0; x < chosenComponent.extInit.length; x++)
			{
				buf = read_param(chosenComponent.extInit[x].params);
				
				answer.extInit[x]= buf.param;
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
			answer.init[1] = (chosenComponent.extInit.name + " (" + buf.param.value + ");");
			
			objInfo += buf.info;
		}
	}
	
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
	
	//** read in information about a default parameter
	buf.param.optional = param.optional;
	
	if (param.optional)
		buf.param.optionalValue = param.optionalValue;
	
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
			document.getElementById("nextAction").innerHTML="Submit";
			generate_question();
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
		check_answer();
		displayingResults = true;
		if (questionNum < 5)
			document.getElementById("nextAction").innerHTML="Next &gt;";
		else
			document.getElementById("nextAction").innerHTML="Retry";
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
	var objName;
	var correct = new Object();
	var buf;
	var pos = new Object();
	
	//** get the response
	response.decl = document.forms["responseform"]["declare"].value;
	response.init = document.forms["responseform"]["init"].value;

	//** get the individual lines of the initialization
	response.init = response.init.split("/\n/");
	
	//** get all of the answer display elements
	ansDisp.div = document.getElementById("answers");
	ansDisp.decl = document.getElementById("decl_answer");
	ansDisp.init = document.getElementById("init_answer");
	
	correct.decl = true;
	correct.init = true;
	
	response.decl = response.decl.trim();
	
	for (var x = 0; x < response.init.length; x++)
		response.init[x].trim();
	
	//** begin correcting the declaration ** -----------------------
	buf = response.decl.split(' ')[0];
	
	//** if they don't use the right component
	if (buf.indexOf(answer.decl) == -1)
		correct.decl = false;
	
	//** check to make sure that there are just two keywords
	correct.decl = decl_check_keywords(response.decl);
	
	//** find the object's declared name
	objName = decl_get_obj_name(response.decl);

	//** validate the name
	if (objName[0] == '!')
	{
		objName = objName.substr(1);
		correct.decl = false;
	}
	else if (objName == "")
	{
		objName = "m_foo";
		correct.decl = false;
	}
	
	if (correct.decl)
	{			
		//** ensure that they declared it as a pointer!
		pos.start = response.decl.indexOf(answer.decl);
		pos.end = response.decl.indexOf(objName);
		pos.loc = response.decl.indexOf('*');
		
		if ((pos.start < pos.loc) && (pos.loc < pos.end))
		{
			if (response.decl.indexOf('*',(pos.loc + 1)) != -1)
				correct.decl = false;
			else if (response.decl.indexOf(';') < pos.end)
					correct.decl = false;
		}
		else
			correct.decl = false;					
	}
	
	console.log("Declaration correct: ",correct.decl);
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

/** UPDATE THE PROGRESS INFORMATION
 *  -------------------------------
 *  Writes progress information to the progress indicator.
 */
function write_progress()
{
	document.getElementById("progressIndicator").innerHTML = questionNum + "/5&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + percentCorrect + '%';
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