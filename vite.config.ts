<?xml version="1.0" encoding="ISO-8859-7" ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head><SCRIPT type="text/javascript">


</SCRIPT>

<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-7" />
<meta name="GENERATOR" content="IBM WebSphere Studio" />
<meta http-equiv="Content-Style-Type" content="text/css" />
<meta http-equiv="expires" content="-1">
<meta http-equiv="pragma" content="no-cache">
<link href="../../theme/Master.css" rel="stylesheet" type="text/css" />
<TITLE>New Calendar</TITLE>
</HEAD>


























































<BODY BGCOLOR="white" TEXT="#000000" LINK="#993366" VLINK="#660066" ALINK="#FF99FF">


<SCRIPT LANGUAGE="JavaScript">
function set_endorsement_date(){

       var i=0;
	 while ((document.RegForm.h_licence_category.value.charAt(i) != "%") && (i< document.RegForm.h_licence_category.value.length)){
               i++;
           }
         
       document.RegForm.h_lic_code.value =  document.RegForm.h_licence_category.value.substring(0,i);
       document.RegForm.h_endors_date.value =  document.RegForm.h_licence_category.value.substring(i+1,document.RegForm.h_licence_category.value.length);
 
}


function validate(){

	var vehicle = document.RegForm.h_vrm.value;
    var center = document.RegForm.h_centre.options[document.RegForm.h_centre.selectedIndex].value;
    var licecat = document.RegForm.h_licence_category.options[document.RegForm.h_licence_category.selectedIndex].value;
    var check="0";
    var checkVRM;
    
   			 
   			 if ((center == "-1") && (check == "0"))
        	   	{alert("Παρακαλώ καταχωρήστε Κέντρο Εξέτασης"); 
        	   	   check=1;}
   
   	       if ((licecat == "-1") && (check == "0"))
        	   	{alert("Παρακαλώ καταχωρήστε Κατηγορία Άδειας");
        	   	check=1;}
        	
        	
        	 if ((vehicle.length == 0) && (check =="0" )) {
		        alert("Παρακαλώ Καταχωρήστε Αρ. Εγγραφής Οχήματος");				
		       check = 1;
	}
        	   	
        	   	
   	      if  (check == "0")
	   	       	{
	   	       	checkVRM=formatVRMnumber(vehicle);
                document.RegForm.h_vrm.value=checkVRM;
	   	       	set_endorsement_date();
	   	       	document.RegForm.submit();}
   	 

   	        
}//end of goToPage


function formatVRMnumber(vrmnumber)    {
		var i=0;
		var j;
		var formatvrm;
		var leftvrm;
		var checkVRM;
	    var newvrmnumber = replaceSubstring(vrmnumber," ","");
	    	checkVRM = newvrmnumber.charAt(i);
	
	
	if (!isNaN(newvrmnumber.charAt(0))){
	while (newvrmnumber.length<6)
	newvrmnumber =" "+newvrmnumber;
	formatvrm =newvrmnumber;
	}
	
	  else{  	
	while ((i < newvrmnumber.length)&& (isNaN(checkVRM))){
	  					i++;
	               checkVRM = newvrmnumber.charAt(i);   
                }
 		j=newvrmnumber.length-1;
 	
    if (i==3){
      leftvrm = newvrmnumber.substring(0,i);
    } 
    
     if (i==2){
      leftvrm = " " + newvrmnumber.substring(0,i);
    } 
    
     if (i==1){
      leftvrm = "  " + newvrmnumber.substring(0,i);
    } 
 	
 		
 	if  (j-i==2) {
 	   	formatvrm=leftvrm+ newvrmnumber.charAt(j-2)+newvrmnumber.charAt(j-1)+newvrmnumber.charAt(j);
 	}
 	
 	else if  (j-i==1) {
 	   	formatvrm=leftvrm+"0"+newvrmnumber.charAt(j-1)+newvrmnumber.charAt(j);
 	}
    
    else if  (j-i==0) {
 	   	formatvrm=leftvrm+"00"+newvrmnumber.charAt(j);
 	}
 	}
    //alert(i);
    //alert(leftvrm);
 	//alert(formatvrm);
 	
    return formatvrm;
     
}//end function formatVRMnumber


function replaceSubstring(inputString, fromString, toString) {
   // Goes through the inputString and replaces every occurrence of fromString with toString
   var temp = inputString;
   if (fromString == "") {
      return inputString;
   }
   if (toString.indexOf(fromString) == -1) { // If the string being replaced is not a part of the replacement string (normal situation)
      while (temp.indexOf(fromString) != -1) {
         var toTheLeft = temp.substring(0, temp.indexOf(fromString));
         var toTheRight = temp.substring(temp.indexOf(fromString)+fromString.length, temp.length);
         temp = toTheLeft + toString + toTheRight;
      }
   } else { // String being replaced is part of replacement string (like "+" being replaced with "++") - prevent an infinite loop
      var midStrings = new Array("~", "`", "_", "^", "#");
      var midStringLen = 1;
      var midString = "";
      // Find a string that doesn't exist in the inputString to be used
      // as an "inbetween" string
      while (midString == "") {
         for (var i=0; i < midStrings.length; i++) {
            var tempMidString = "";
            for (var j=0; j < midStringLen; j++) { tempMidString += midStrings[i]; }
            if (fromString.indexOf(tempMidString) == -1) {
               midString = tempMidString;
               i = midStrings.length + 1;
            }
         }
      } // Keep on going until we build an "inbetween" string that doesn't exist
      // Now go through and do two replaces - first, replace the "fromString" with the "inbetween" string
      while (temp.indexOf(fromString) != -1) {
         var toTheLeft = temp.substring(0, temp.indexOf(fromString));
         var toTheRight = temp.substring(temp.indexOf(fromString)+fromString.length, temp.length);
         temp = toTheLeft + midString + toTheRight;
      }
      // Next, replace the "inbetween" string with the "toString"
      while (temp.indexOf(midString) != -1) {
         var toTheLeft = temp.substring(0, temp.indexOf(midString));
         var toTheRight = temp.substring(temp.indexOf(midString)+midString.length, temp.length);
         temp = toTheLeft + toString + toTheRight;
      }
   } // Ends the check to see if the string being replaced is part of the replacement string or not
   return temp; // Send the updated string back to the user
} // Ends the "replaceSubstring" function

</script>	







<FORM method=post name ="RegForm" action="NewCalendarDate.jsp?lang=gr">
<span class="dl-bodytext">

  <table width="537" height="30">
    <tr>
      <th scope="col"><div align="left"><font face="Verdana"  color="#464646" size="2"><b>Πληρωμή για Εξέταση Άδειας Οδηγού</b></font></div></th>
    </tr>
    <tr>
      <td align="right" colspan=2><hr>
    </tr>
    <br>
  </table>

<TABLE width="700">
	<TBODY>
		<TR>
			<TD height="30" valign="middle" align="left" width="25%"><B>
			<font face="Verdana"  color="#004d4b" size="1">Κέντρο Εξέτασης:</B></TD>
			<TD><font face="Verdana"  color="#004d4b" size="1">
    		<SELECT name="h_centre">
            <OPTION selected value="-1">Κέντρο Εξέτασης</OPTION>
            			<OPTION value=7>Δερύνειας</OPTION>
<OPTION value=3>Λάρνακας</OPTION>
<OPTION value=2>Λεμεσού</OPTION>
<OPTION value=1>Λευκωσίας</OPTION>
<OPTION value=4>Πάφου</OPTION>
</select></font></div></td>

</SELECT></td>
</tr> 

 <tr><td></td><td><br></td>
 </tr>  
 <TR>
			<TD height="30" valign="middle" align="left" width="25%"><B>
			<font face="Verdana"  color="#004d4b" size="1">Κατηγορία Άδειας:</B></TD>
			<TD><font face="Verdana"  color="#004d4b" size="1" width="30%">
			<input type="hidden" name="h_lic_code" size="24" value=""> 
	        <input type="hidden" name="h_endors_date" size="24" value=""> 
    		<SELECT name="h_licence_category">
    		<OPTION selected value="-1">Κατηγορία Άδειας</OPTION>		
    		
    
         <OPTION  value="ΒΒ%24/04/2026">ΒΒ</OPTION>	
         
         
         
         
         
          
         </select>&nbsp;<font face="Verdana"  color="#004d4b" size="1" valign="middle" align="left"><b>
			
			<a target="_new" href="DriverCategories.pdf">Κατηγορίες άδειας οδήγησης</a></b></font></div></td>
</SELECT></td>
</tr> 
 <tr><td></td><td><br></td>
 </tr>  
	<tr>
			<TD height="30" valign="middle" align="left" width="25%"><B>
			<font face="Verdana"  color="#004d4b" size="1">Αρ. Εγγραφής Οχήματος:</B></TD>
			<TD><font face="Verdana"  color="#004d4b" size="1"><input name="h_vrm" type="text" size="16" maxlength=7 onChange="javascript:this.value=this.value.toUpperCase();">
    	    </td>
    	    <td></td>
	 </tr> 
	 <tr>
			<TD height="30" valign="middle" align="left" colspan="2"><B>
			<font face="Verdana"  color="#004d4b" size="1" >(Το όχημα που δηλώνεται για την εξέταση πρέπει να είναι κατάλληλο για την κατηγορία εξέτασης)
			</b></TD>
	 </tr> 
	
<tr>
<td></td>

<td height="30" valign="middle" align="left">
	<input id="submitBtn" type=button value="Επόμενο" size="24" style="background-color: #FFFFFF" onclick="validate()">
</td>
</tr>
</TBODY>
</table>
<input type="hidden" value="582014850  0" name="h_pid_number"/>
</span>

</FORM>
 

</BODY>
</HTML>

