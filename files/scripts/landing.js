/** SCRIPTS FOR THE LANDING PAGE
 * 
 */

function cppSelected()
{
	if (!is_mobile())
	{
		document.getElementById("tname").innerHTML = "C++ Guided Tutorial";
		document.getElementById("tdesc").innerHTML = "This tutorial will guide new programmers through the tutorial at cplusplus.com, providing activities to practice new programming skills."
	}
}

function wpiSelected()
{
	if (!is_mobile())
	{
		document.getElementById("tname").innerHTML = "WPILib";
		document.getElementById("tdesc").innerHTML = "This tutorial will teach programmers with C++ knowledge how to use the WPI C++ library to program FRC robots."
	}
}

function aboutSelected()
{
	if (!is_mobile())
	{
		document.getElementById("tname").innerHTML = "About";
		document.getElementById("tdesc").innerHTML = "&nbsp;"
	}
}

function resetAll()
{
	if (!is_mobile())
	{
		document.getElementById("tname").innerHTML = "Paul's Tutorials";
		document.getElementById("tdesc").innerHTML = "Select an option.";
	}
}