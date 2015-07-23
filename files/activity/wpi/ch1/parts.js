/** WPI 1-1 PARTS OF THE ROBOT ACTIVITY SCRIPTS
 * 
 * Author: Paul Bonnen
 */

var partsList;
var answer;
var alreadyUsed;
var percentCorrect;
var questionsAnswered;
var correctAnswers;
var questionNum;
var displayingResult;

/** ACTIVITY INITIALIZATION
 *  -----------------------
 *  Initializes all variables needed to run the activity
 *  and shows the activity content. 
 */
function activity_init()
{
	var tcontent = document.getElementById("tcontent");
	var activityContent = document.getElementById("activityContent");
	var startButton = document.getElementById("start");
	
	percentCorrect = 100;
	questionNum = 1;
	displayingResult = false;
	alreadyUsed = new Array();
	get_parts_list();
	
	questionsAnswered = 0;
	correctAnswers = 0;
	
	tcontent.style.display = "none";
	activityContent.style.display = "block";
	startButton.style.display = "none";
	
	write_progress();
	
	window.location.replace("#_activityStart");
}

/** GET PARTS LIST
 *  --------------
 *  Gets the parts list from the remote server
 *  and stores it into an object. When complete,
 *  it generates the first question.
 */
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


/** GENERATE QUESTION
 *  -----------------
 *  Generates a question using the parts
 *  list. Ensures that the same part
 *  is not asked twice.
 */
function generate_question()
{
	var imgDisp = document.getElementById("questionImg");
	
	do
	{
		answer = getRandomInt(0, (partsList.length - 1));
	}while(alreadyUsed.indexOf(answer) != -1);
	
	alreadyUsed.push(answer);
	
	imgDisp.src = partsList[answer].img;
	
	if (!(partsList[answer].category))
		document.getElementById("catContain").style.display = "none";
	else
		document.getElementById("catContain").style.display = "block";
}

/** RUN NEXT ACTION
 *  ---------------
 *  Depending on the context, this function will:
 *  
 *  - Check your answers and display them
 *  - Clear the form and display a new question
 */
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

/** CHECK ANSWER
 *  ------------
 *  Checks a given response.
 *  
 * @returns {CorrectObject}: An object representing each answer and whether or not it is correct.
 */
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

/** SCORE ANSWER
 *  ------------
 *  Score an answer
 *  
 * @param correct: The CorrectObject for the response
 */

function score_answer(correct)
{
	if (partsList[answer].category)
	{
		if (correct.name)
			correctAnswers += 1;
		if (correct.category)
			correctAnswers += 1;
	}
	else if (correct.name)
		correctAnswers += 2;
	
	questionsAnswered += 2;
	
	percentCorrect = (correctAnswers / questionsAnswered) * 100;
}

/** REPORT ANSWER
 *  -------------
 *  Display the results of a response
 *  on the screen.
 * 
 * @param correct: The CorrectObject for the response.
 */
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
		buf += "<span style='color: #00cc00; font-size: 1.5em;'> &#10004;</span></li>";
	else
	{
		buf += "<span style='color: #ff0000; font-size: 1.5em;'> &#10008;</span></li>";
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
			buf += "<span style='color: #00cc00; font-size: 1.5em;'> &#10004;</span></li>";
		else
		{
			buf += "<span style='color: #ff0000; font-size: 1.5em;'> &#10008;</span></li>";
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

/** WRITE PROGRESS
 *  --------------
 *  Write progress information about the activity
 *  to the designated space on the page
 */
function write_progress()
{
	var progress; 
	
	progress = questionNum + "/10&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
	progress += "<span style='color: " + calcColor() + ";'>" + percentCorrect.toFixed(1) + "%</span>";
	document.getElementById("activityProgress").innerHTML = progress;
}

/** CALCULATE PERCENTAGE COLOR
 *  --------------------------
 *  Calculates a color for a given percentage correct.
 * 
 * @returns {String}: The color to use for the current percentage
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

/** HEX TO RGB
 *  ----------
 *  Converts a hex color to an RgbObject
 * 
 * @param hex: A hex string representing the color
 * @returns {RgbObject}
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

/** RGB TO HEX
 *  ----------
 *  Converts an RgbObject to a hex string.
 * 
 * @param rgb: the RgbObject for this color
 * @returns {String}: a hex string representing the color
 */
function rgbToHex(rgb) {
	return "#" + componentToHex(rgb.r) + componentToHex(rgb.g) + componentToHex(rgb.b); 
}

/** COMPONENT TO HEX
 *  ----------------
 *  Converts a given color component to a hex string.
 * 
 * @param c: the numeric color component
 * @returns {String}: a hex string for that component
 */
function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

/** GET RANDOM INTEGER
 *  ------------------
 * 
 * @param lower: the lower bound
 * @param upper: the upper bound
 * @returns {int}: a random integer
 */
function getRandomInt (lower, upper)
{
	return (Math.floor(Math.random() * ((upper - lower) + 0.5)) + lower);
}