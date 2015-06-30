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
	var questionDisplay = new Object();
	var chosenComponent;
	var randComponent = Math.floor(Math.random() * partsList.length);
	var useImg;
	var objInfo;
	
	chosenComponent = partsList[randComponent];

	if (Math.floor(Math.random() + 0.5) == 0)
		useImg = false;
	else
		useImg = true;
	
	questionDisplay.img = document.getElementById("componentImage");
	questionDisplay.name = document.getElementById("componentName");
	questionDisplay.info = document.getElementById("componentInfo");
	
	questionDisplay.info.innerHTML = "";
	
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
			answer.init = "new "+chosenComponent.name;
			if (chosenComponent.params.constructor === Array)
			{
			
			}
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
	}
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
		return Math.floor(Math.random() * 10);
	else if (port == "Relay" || port == "Analog" || port == "USB")
		return Math.floor(Math.random() * 4);
	else if (port == "Solenoid")
		return Math.floor(Math.random() * 8);
	else if (port == "CAN")
	{
		if ((Math.floor(Math.random() + 0.5)) == 0)
				return 0;
		else
			return (Math.floor(Math.random() * 62) + 1);
	}
}

function getRandomBool ()
{
	return (Math.floor(Math.random + 0.5) == 1);
}