/** NAVIGATION SCRIPT **/

function setContext (tutorial, chapter, lesson)
{
	var ttDisplay = document.getElementById("ttLink");
	var chDisplay = document.getElementById("ttCh");
	var lessonDisplay = document.getElementById("ttLesson");
	var target, buf;
	
	if (chapter == "")
	{
		hideChapter();
		hideLesson();
	}
	else if (lesson == "")
		hideLesson();
	
	target = document.getElementById(tutorial);
	
	cloneAnchor(target, ttDisplay);
	
	if (chapter != "")
	{
		buf = tutorial + '-' + chapter;
		target = document.getElementById(buf);
		
		cloneAnchor(target, chDisplay);
		
		buf = tutorial + "-list";
		document.getElementById(buf).className = "active";
		
		if (lesson != "")
		{
			buf = tutorial + '-' + chapter + '-' + lesson;
			target = document.getElementById(buf);
			
			cloneAnchor(target,lessonDisplay);
			
			buf = tutorial + '-' + chapter + "-list";
			document.getElementById(buf).className = "active";
		}
	}
}

function hideChapter()
{
	var chapterDiv = document.getElementById("navLvl2");
	var chapterSep = document.getElementById("sep-2");
	
	chapterDiv.style.display = none;
	chapterSep.style.display = none;
}

function hideLesson()
{
	var lessonDiv = document.getElementById("navLvl3");
	var lessonSep = document.getElementById("sep-3");
	
	lessonDiv.style.display = none;
	lessonSep.style.display = none;
}

function cloneAnchor (original, clone)
{
	clone.innerHTML = original.innerHTML;
	clone.href = original.href;
}