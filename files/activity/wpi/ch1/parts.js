/** WPI 1-1 PARTS OF THE ROBOT ACTIVITY SCRIPTS
 * 
 * Author: Paul Bonnen
 */

var partsList;
var answer;
var percentCorrect;
var questionNum;
var displayingResult;

function activity_init()
{
	var tcontent = document.getElementById("tcontent");
	var activityContent = document.getElementById("activityContent");
	var startButton = document.getElementById("start");
	
	percentCorrect = 0;
	questionNum = 1;
	displayingResult = false;
	get_parts_list();
	
	tcontent.style.display = "none";
	activityContent.style.display = "block";
	startButton.style.display = "none";
	
	window.location.replace("#_activityStart");
}

function get_parts_list()
{
	var xrq = new XMLHttpRequest();
	var raw;
	
	xrq.responseType = "text";
	xrq.open("GET", "https://raw.githubusercontent.com/hal7df/pauls-tutorials/master/files/activity/wpi/ch1/parts.json", true);
	
	xrq.onreadystatechange = function () {
		if (xrq.readyState == 4 && xrq.status == "200")
		{
			raw = xrq.response;
			partsList = JSON.parse(raw);
			generate_question();
		}
	}
	
	xrq.send(null);
}

function generate_question()
{
	var imgDisp = document.getElementById("questionImg");
	
	answer = getRandomInt(0, (partsList.length - 1));
	
	console.log("Chosen component:",partsList[answer].name);
	
	imgDisp.src = partsList[answer].img;
	
	if (!(partsList[answer].category))
		document.getElementById("catContain").style.display = "none";
	else
		document.getElementById("catContain").style.display = "block";
}

function run_next_action()
{
	if (displayingResults)
	{
		if (questionNum < 10)
		{
			questionNum++;
			write_progress();
			displayingResults = false;
			
			document.forms["responses"].reset();
			document.forms["responses"].style.display = "block";
			document.getElementById("answerDisplay").style.display = "none";
			
			document.getElementById("next").innerHTML = "Submit";
			generate_question();
			window.location.replace("#_activityStart");
		}
		else
		{
			window.location.replace("#Activity");
			window.location.reload();
		}
	}
	else
	{
		var correct;
		correct = check_answer();
		score_answer(correct);
	}
}

function check_answer()
{
	var correct = new Object();
	
	var name = document.forms["responses"]["name"].value;
	var category = document.forms["responses"]["category"].value;
	
	name = name.toUpperCase();
	category = category.toUpperCase();
	
	correct.name = (name == (partsList[answer].name.toUpperCase()));
	
	if (partsList[answer].category)
	{
		category = replace_category_alias(category);
		
		correct.category = (category == (partsList[answer].category.toUpperCase()));
	}
	
	return correct;
}

function replace_category_alias(catStr)
{
	catStr = catStr.replace("INPUT", "SENSOR");
	catStr = catStr.replace("DRIVE CONTROLLER", "MOTOR CONTROLLER");
	
	return catStr;
}

function score_answer(correct)
{
	if (partsList[answer].category)
	{
		if (correct.name)
			percentCorrect += 5;
		if (correct.category)
			percentCorrect += 5;
	}
	else if (correct.name)
		percentCorrect += 10;
}

function report_answer(correct)
{
	var report = new Object();
	var response = new Object();
	
	report.name = document.getElementById("nameDisp");
	report.cat = document.getElementById("catDisp");
	report.desc = document.getElementById("descDisp");
	
	response.name = document.forms["responses"]["name"];
	response.category = document.forms["responses"]["category"];
	response.desc = document.forms["responses"]["desc"];
	
	
}

function write_progress()
{
	document.getElementById("activityProgress").innerHTML = questionNum + "/10&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + percentCorrect.toFixed(1) + '%';
}

function getRandomInt (lower, upper)
{
	return (Math.floor(Math.random() * ((upper - lower) + 0.5)) + lower);
}