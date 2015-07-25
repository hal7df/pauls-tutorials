/** Page tools
 * 
 * Mobile browser detection from StackOverflow
 *
 * http://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
 */

function is_mobile()
{
	var mobile;
	
	mobile = navigator.userAgent.match(/Android/i);
	mobile = (mobile || navigator.userAgent.match(/iPhone/i));
	mobile = (mobile || navigator.userAgent.match(/iPod/i));
	mobile = (mobile || navigator.userAgent.match(/iPad/i));
	mobile = (mobile || navigator.userAgent.match(/Windows Phone/i));
	mobile = (mobile || navigator.userAgent.match(/BlackBerry/i));
	mobile = (mobile || navigator.userAgent.match(/Mobile/i)) //Firefox OS
	mobile = (mobile || navigator.userAgent.match(/webOS/i));
	
	return mobile;
}