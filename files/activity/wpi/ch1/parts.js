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
	if (displayingResult)
	{
		if (questionNum < 10)
		{
			questionNum++;
			write_progress();
			displayingResult = false;
			
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
		report_answer(correct);
		write_progress();
		displayingResult = true;
		
		if (questionNum < 10)
			document.getElementById("next").innerHTML = "Next &gt;";
		else
			document.getElementById("next").innerHTML = "Retry";
		
		window.location.replace("#_activityStart");
	}
}

function check_answer()
{
	var correct = new Object();
	var corrFlag;
	
	var name = document.forms["responses"]["name"].value;
	var category = document.forms["responses"]["category"].value;
	
	name = name.toUpperCase();
	category = category.toUpperCase();
	
	if (partsList[answer].name.constructor === Array)
	{
		corrFlag = false;
		for (var x = 0; x < partsList[answer].name.length; x++)
		{
			if (name == partsList[answer].name[x].toUpperCase())
			{
				corrFlag = true;
				break;
			}
		}
		
		correct.name = corrFlag;
	}
	else
		correct.name = (name == (partsList[answer].name.toUpperCase()));
	
	if (partsList[answer].category)
	{
		if (partsList[answer].category.constructor === Array)
		{
			corrFlag = false;
			for (var x = 0; x < partsList[answer].category.length; x++)
			{
				if (category == partsList[answer].category[x].toUpperCase())
				{
					corrFlag = true;
					break;
				}
			}
			
			correct.category = corrFlag;
		}
		else
			correct.category = (category == (partsList[answer].category.toUpperCase()));
	}
	
	return correct;
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
	var buf;
	
	report.name = document.getElementById("nameDisp");
	report.cat = document.getElementById("catDisp");
	report.desc = document.getElementById("descDisp");
	
	response.name = document.forms["responses"]["name"].value;
	response.cat = document.forms["responses"]["category"].value;
	response.desc = document.forms["responses"]["desc"].value;
	
	buf = "<li>Your response: " + response.name;
	
	if (correct.name)
		buf += "<span style='color: #00cc00;'>&#10004;</span></li>";
	else
	{
		buf += "<span style='color: #ff0000;'>&#10008;</span></li>";
		buf += "<li>Correct answer: ";
		
		if (partsList[answer].name.constructor === Array)
			buf += partsList[answer].name[0] + "</li>";
		else
			buf += partsList[answer].name + "</li>";
	}
	
	report.name.innerHTML = buf;
	
	if (partsList[answer].category)
	{
		buf = "<li>Your response: " + response.cat;
		
		if (correct.category)
			buf += "<span style='color: #00cc00;'>&#10004;</span></li>";
		else
		{
			buf += "<span style='color: #ff0000;'>&#10008;</span></li>";
			buf += "<li>Correct answer: ";
			
			if (partsList[answer].category.constructor === Array)
				buf += partsList[answer].category[0] + "</li>";
			else
				buf += partsList[answer].category + "</li>";
		}
		report.cat.innerHTML = buf;
	}
	else
	{
		report.cat.innerHTML = "<li>Category not applicable</li>";
	}
	
	buf = "<li>Your response: " + response.desc + "</li>";
	buf += "<li>Example answer: " + partsList[answer].description + "</li>";
	
	report.desc.innerHTML = buf;
	
	document.getElementById("answerDisplay").style.display = "block";
	document.forms["responses"].style.display = "none";
}

function write_progress()
{
	document.getElementById("activityProgress").innerHTML = questionNum + "/10&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + percentCorrect.toFixed(1) + '%';
}

function getRandomInt (lower, upper)
{
	return (Math.floor(Math.random() * ((upper - lower) + 0.5)) + lower);
}