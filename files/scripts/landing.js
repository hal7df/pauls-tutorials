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

function scrSelected()
{
	if (!is_mobile())
	{
		document.getElementById("extname").innerHTML = "WPI ScreenSteps";
		document.getElementById("extdesc").innerHTML = "Get started with the tools for programming your robot.";
	}
}

function doxSelected()
{
	if (!is_mobile())
	{
		document.getElementById("extname").innerHTML = "WPI/C++ Doxygen";
		document.getElementById("extdesc").innerHTML = "Class reference for WPILib";
	}
}

function gitSelected()
{
	if (!is_mobile())
	{
		document.getElementById("extname").innerHTML = "The HOT Team on GitHub";
		document.getElementById("extdesc").innerHTML = "Check out our code from past years, utilities, and more";
	}
}

function resetAll()
{
	if (!is_mobile())
	{
		document.getElementById("tname").innerHTML = "Paul's Tutorials";
		document.getElementById("tdesc").innerHTML = "Select an option.";
		document.getElementById("extname").innerHTML = "External Resources";
		document.getElementById("extdesc").innerHTML = "&nbsp;";
	}
}