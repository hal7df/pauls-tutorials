var answer;
var numCorrect;
var partsList;
var questionNum;
var displayingResults;

function activity_init()
{
	answer = new Object();
	questionNum = 1;
	numCorrect = 0;
	displayingResults = false;
	get_parts_list();
	
	document.getElementById("_activity").style.display = "block";
	document.getElementById("startActivity").style.display = "none";
	write_progress();
	
	window.location.replace("#_activitystart");
}

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

function generate_question()
{	
	for (var member in answer)
		delete answer[member];
	
	var questionDisplay = new Object();
	var chosenComponent;
	var randComponent = Math.floor(Math.random() * partsList.length);
	var useImg;
	var objInfo;
	var buf;
	var flag;
	
	chosenComponent = partsList[randComponent];

	if (Math.floor(Math.random() + 0.5) == 0)
		useImg = false;
	else
		useImg = true;
	
	questionDisplay.img = document.getElementById("componentImage");
	questionDisplay.name = document.getElementById("componentName");
	questionDisplay.info = document.getElementById("componentInfo");
	
	questionDisplay.info.innerHTML = "";
	objInfo = "";
	
	if (chosenComponent.generic)
	{
		randComponent = Math.floor(Math.random() * chosenComponent.devices.length);
		
		if (!useImg || !chosenComponent.devices[randComponent].img)
		{
			questionDisplay.name.style.display = "block";
			questionDisplay.name.innerHTML = chosenComponent.devices[randComponent].name;
			questionDisplay.img.style.display = "none";
		}
		else
		{
			questionDisplay.img.style.display = "block";
			questionDisplay.img.src = chosenComponent.devices[randComponent].img;
			questionDisplay.name.style.display = "none";
		}
		
		answer.decl = chosenComponent.devices[randComponent].name;
		
		if (!chosenComponent.params)
			answer.init = "new "+chosenComponent.name+';';
		else
		{
			if (chosenComponent.params.port != false)
				answer.port = getRandomPort(chosenComponent.params.port);
			
			answer.paramsOptional = true;
			answer.init += (" (" +answer.port+");");
			
			objInfo="<li>";
			
			if (chosenComponent.params.abstractdef)
				objInfo += (chosenComponent.params.description + ": ");

			if (chosenComponent.params.port != "USB")
				objInfo += (chosenComponent.params.port + ' ');
			
			objInfo += (answer.port + "</li>");
			
			questionDisplay.info.innerHTML = objInfo;
		}
	}
	else
	{
		if (!useImg || !chosenComponent.img)
		{
			questionDisplay.name.style.display = "block";
			questionDisplay.name.innerHTML = chosenComponent.display;
			questionDisplay.img.style.display = "none";
		}
		else
		{
			questionDisplay.img.style.display = "block";
			questionDisplay.img.src = chosenComponent.img;
			questionDisplay.name.style.display = "none";
		}
		
		answer.decl = chosenComponent.name;
		
		if (!chosenComponent.params)
			answer.init = "new "+chosenComponent.name+';';
		else if (chosenComponent.params == "GetInstance")
			answer.init = chosenComponent.name+"::GetInstance();";
		else
		{
			answer.init = "new " + chosenComponent.name + " (";
			if (chosenComponent.params.constructor === Array)
			{
				answer.params = new Array();
				
				for (var x = 0; x < chosenComponent.params.length; x++)
				{
					do
					{
						flag = false;
						buf = read_param(chosenComponent.params[x])
						
						for (var y = x-1; y >= 0; y--)
						{
							if (buf.param.value == answer.params[y].value && chosenComponent.params[x].port == chosenComponent.params[y].port)
								flag = true;
						}
					}while(flag);
					
					answer.params[x] = buf.param;
					
					answer.init += (buf.param.value + ", ");

					objInfo += buf.info;
				}
			}
			else
			{
				buf = read_param(chosenComponent.params);
				
				answer.params = buf.param;
				answer.init += (buf.param.value + ");");
				
				objInfo = buf.info;
			}
		}
	}
	
	questionDisplay.info.innerHTML = objInfo;
}

function read_param (param)
{
	var buf = new Object();
	
	buf.param = new Object();
	
	if (param.port != false)
		buf.param.value = getRandomPort(param.port);
	else
	{
		if (param.type == "bool")
			buf.param.value = getRandomBool();
		else if (param.type == "float")
			buf.param.value = getRandomFloat(param.range[0], param.range[1]);
	}
	
	buf.param.optional = param.optional
	
	if (param.optional)
		buf.param.optionalValue = param.optionalValue;
	
	buf.info = "<li>";
	
	if (param.abstractdef)
		buf.info += (param.description + ": ");
	
	if (param.port != "USB" && param.port != false)
		buf.info += (param.port + ' ');
	
	buf.info += (buf.param.value + "</li>");
	
	return buf;
}

function run_finish_action()
{
	if (displayingResults)
	{
		if (questionNum < 5)
		{
			questionNum++;
			write_progress();
			displayingResults = false;
			document.getElementById("nextAction").innerHTML="Submit";
			generate_question();
		}
		else
		{
			window.location.replace("#Activity");
			window.location.reload();
		}
	}
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

function check_answer()
{

}

function write_progress()
{
	document.getElementById("progressIndicator").innerHTML = questionNum + "/5&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + (numCorrect/5) + '%';
}

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

function getRandomBool ()
{
	return (Math.floor(Math.random() + 0.5) == 1);
}

function getRandomInt (lower,upper)
{
	return (Math.floor(Math.random() * ((upper - lower) + 0.5)) + lower);
}

function getRandomFloat (lower,upper)
{
	return ((Math.random() * (upper - lower)) + lower);
}