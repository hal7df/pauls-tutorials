var answer;
var partsList;
var questionNum;

function activity_init()
{
	answer = new Object();
	questionNum = 1;
	get_parts_list();
	
	document.getElementById("_activity").style.display = "block";
	document.getElementById("startActivity").style.display = "none";
	document.getElementById("progressIndicator").innerHTML = questionNum + "/5";
	
	window.location.replace("#_activitystart");
}

function get_parts_list()
{
	var xrq = new XMLHttpRequest();
	var raw;
	
	//xrq.overrideMimeType("application/json");
	xrq.open("GET", "https://raw.githubusercontent.com/hal7df/pauls-tutorials/master/files/activity/wpi/ch1/parts-code.json", true);
	
	xrq.onreadystatechange = function () {
		if (xrq.readyState == 4 && xrq.status == "200")
		{
			raw = xrq.response;
			console.log("SUCCESS");
			partsList = JSON.parse(raw);
		}
		else
			console.log("FAILURE");
	};
	xrq.send(null);
	
	console.log("PartsList finished.");
}

function generate_question()
{
	
}