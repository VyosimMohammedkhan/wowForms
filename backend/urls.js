
module.exports = {

    urls: [
        // "https://www.hugedomains.com/contact.cfm",   //p
        // "https://twitter.com/Contom/contact.html",   //p //no form
        // "https://www.hireheronow.com/contact",   //p  //multiple forms
        // "https://www.cwood.org/cwood/contact_cwood/",      //p
        // "http://www.itcscorp.net/contactus.html",    //p
        // "https://www.hetlinger.org/contact-us",     //p  //captcha???
        // "https://commoditystaffing.com/#contact",   //p
        // "https://www.hrstaff.net/contact/",     //p //iframe //dropdown is an input tag
        // "https://www.staffingbyse7en.com/",     //p  //form is in footer
        // "https://ilanascaremiami.com/contact-us",    //p // no placeholders or labels //custom captcha
        // "https://www.wastaffingllc.com/contact-us",  //p
        // "https://www.deanstaffingandrecruiting.com/contact",       //captcha
        // "https://help.accessncworks.com/hc/en-us/articles/360019765091-Contact-Information", //p
        // "https://www.careertransitionsllc.com/placement-services/", //p
        // "https://www.laborquicknc.com/?utm_source=rsd&utm_medium=gmb#Contact-Us", //p
        // "http://formularesources.com/#contact",         //p //no placeholder and labels. value used instead of placeholder
        // "https://www.thepattytiptoncompany.com/contact-us", //p
        // "https://www.escstaff.com/contact.html",    //p
        // "https://www.asapstaffing24-7.com/contact-us",  //p
        // "https://hirequest.com/contact-us/",    //P
        // "https://www.wellingtonexecutivesearch.com/contact-us",  //f email is textarea //iframe
        // "https://www.bcsmis.com/contact-us/",   //p
        // "https://workforceatlas.org/contact",   //p
        // "https://www.fgp.com/contact-us/",   //p
        // "https://connexissearch.com/contact/",  //f form takes too long to load //iframe //not solved yet
        // "https://www.isg-staffing.com/contact", //captcha
        // "https://www.gemresourcing.com/contact-us/",    //f because of cookie popup
        // "https://www.abicsl.com/contact-us",    //p //no label or placeholder
        // "https://assuredemploymentstaffing.com/contact", //p
        // "https://www.expresspros.com/CouncilBluffsIA/Contact-Us/Default.aspx",  //p
        // "https://www.springbornstaffing.com/temporary-staffing-companies/",     //p
        // "https://www.taylortechnical.com/contact/", //p
        // "https://copelandstaffingandrecruiting.com/contact-us", //p
        // "https://aggressivehiring.com/contact-us/",     //p
        // "https://www.msfingerlakes.com/contact-us-2/",       //p
        // "https://www.can-amconsultants.com/contact.php", //p
        // "https://thecandoragency.net/contact-us",       //p
        // "https://lehmancr.com/contact/",        //f email not filled in the right field
        // "https://www.davidjosephinc.com/contact/",  //p
        // "https://www.nexgoal.com/recruiting-services-contact/",     //f failing due to conflict in xpath priority
        // "https://ehospitalhire.com/contact-us/",    //p
        // "https://bridgeworkpartners.com/contact-us/",   //p
        // "https://www.faharistaffing.com/contact-us/",   //p
        // "https://www.repucare.com/contact-5",   //p
        // "https://onsitesvs.com/contact-us",     //p
        // "https://getbsquared.com/contact/",     //p
        // "https://ajc.lincoln.ne.gov/contact-us/",   //p
        // "https://www.mystaffinc.com/contact/",     //p      
        // "https://theconnectagency.co/contact",      //f form is not present but it's detected in html
        // "https://eliteresources.net/employers",  //f form is detected but not filled
        // "http://www.premierestaffing.net/Premiere2014/contact.html",        //p
        // "https://www.lighthousehrs.net/contact/contact-us",     //captcha
        // "http://www.kaiserwhitney.com/contact/",        //f message typed in phone field. not making sense
        // "https://www.besttemps.com/contact",        //p
        // "https://www.aheadhr.com/contact-us/",       //f dropdown required and last name is not filling
        // "https://huntsville.snelling.com/contact/",      //f  zip code is required and should match the given US state
        // "https://outsource.net/contact/",   //f no form present but its detected in html
        // "https://www.coadvantage.com/contact-us/",      //p
        // "https://stafftodayinc.com/contact-us.html",     //p
        // "https://staffingspecifix.com/contact-us/",     //captcha
        // "https://www.sebenzasource.com/sebenza/contact",        //p
        // "https://www.promptprioritystaffing.com/contact",       //f other mandatory fields present
        // "https://www.arlingtonva.us/Home/Contact-Arlington",        //p
        // "https://www.pettitstaffing.com/contact",        //p
        // "http://ptalents.com/#formulario_contacto",     //f name not filled
        // "https://www.ahelpinghandstaffing.com/contact",     //captcha
        // "https://www.alpstaffing.com/contact",      //p
        // "https://hr.infoprosol.com/contactus.html",     //f form not filled
        // "https://www.expresspros.com/LongviewWA/Contact/Longview/",     //f radio button mandatory
        // "https://energeostaffing.com/contact-us/",      //captcha
        // "https://www.staffingplusjobs.com/contact/",     //p
        // "https://www.consilio.com/contact/",    //p
        // "https://www.reliantstaffing.com/contact/",  //p
        // "https://www.aramark.com/about-us/enterprise-solutions/dietetic-internship/-us",        //p
        // "https://saleminc.com/contact-us/",     //p
        // "https://talentteam.com/contact-us/",    //captcha
        // "https://x3tradesmen.com/contact-us/",      //captcha
        // "https://www.greencountrystaffing.com/contact/",        //p
        // "https://www.positiveresultsstaffing.com/",     //p
        // "http://allstaffusa.com/contact.php",    //p
        // "https://thejobshoppe.com/contact-us/",     //p
        // "https://www.hamilton-ryker.com/contact/",       //p
        // "https://www.solutionsstaffing.com/contact/",       //p
        // "https://caracollective.org/contact/",       //f form not filled
        // "https://promaxpersonnel.com/contact-us/",       //p
        // "https://www.seekcareers.com/contact-us/",       //captcha
        // "https://arrowworkforce.com/contact-us/",        //captcha
        // "http://www.suntechpros.com/",      //captcha
        // "https://www.ebintl.com/ContactUS",      //f form not filled
        // "https://digipulsetech.com/contact-us/",     //f address is textarea
        // "https://xyant.com/contact-us/",     //f name not filled
        // "https://www.luxoft.com/contact-form",       //captcha
        // "https://www.blackknightinc.com/contact-us/?",       //captcha
        // "http://www.sibitalent.com/contact.php",     //f form not filled
        // "https://sparibis.com/s/contact",        //p
        // "https://infinitysolutions.ca/contact-us/",      //f name not filled
        // "https://creospan.com/contact-us/",      //f name not filled
        // "http://www.vertexsolutionsinc.com/contact.shtml",       //p 
        // "http://www.highbridgeusa.com/contactus.html",       //
        // "http://www.pintegrallc.com/?page_id=17",        //p
        // "http://biz3tech.com/contact/",
        // "https://www.smartsourcetec.com/contact_us",
        // "https://itscient.com/contact-us",
        // "https://www.neweratech.com/us/contact-us/",
        // "https://www.grantpeters.com/contact-grant-peters-associates.html",
        // "https://www.useready.com/contact-us/",
        // "https://www.marathonus.com/contact/",
        // "https://talentiqo.com/contact-us/",
        // "http://www.corevance.com/contact.html",
        // "https://tumblekidswatertown.com/contact/",
        // "https://www.affinity.co/contact-us",
        // "https://www.helloflare.com/copy-of-disability-contact-form",
        // "https://soccershopusa.com/contact/",
        // "https://www.globalcu.org/financial-planning/contact/",
        // "https://www.indstate.edu/contact",
        // "https://www.simplot.com/contact_us",
        // "https://www.sohohouse.com/en-us/contact",
        // "https://familiesusa.org/about/#contact-us",
        // "https://lcsnw.org/about/contact/",
        // "https://www.alto.us/contact/",
        // "https://www.tpicap.com/",
        // "https://www.aaryah.com/pages/contact-us",
        // "https://www.raysearchlabs.com/about/contact/",
        // "https://www.chromaus.com/contact.html",
        // "http://www.anrcomfortcare.com/contact-us.html",
        // "https://www.abm.com/contact/",
        // "https://www.pegasusresidential.com/contact-us",
        // "https://www.jorgeng.com/contact",
        // "https://morganwhite.com/contact",
        // "https://mrscleanpgh.com/contact/",
        // "https://www.simonswerk.com/service/contact",
        // "https://stonemountaintoyota.com/contact-us",
        // "https://www.cheyenneregional.org/contact/",
        // "https://www.paivafinancial.com/contact",
        // "https://sciodpm.com/contact/",
        // "https://mstaxprep.com/contact-us/",
        // "https://www.redpointglobal.com/company/contact/",
        // "https://www.frankhajekandassociates.com/contact.php",
        // "http://www.trif.com/contact-us/",
        // "https://www.m-csi.com/contact-us/",
        // "http://kkdesignonline.com/#contact",
        // "http://www.ncomm.com/ncomm/contact-us",
        // "https://telebright.com/#contact",
        // "https://www.bdkinc.com/contact",
        // "https://healaccounting.com/contact-us/",
        // "https://cyberconnection.us/contact-us/",
        // "https://tannerwest.com/contact-us/",
        // "http://techsolutionsmaine.com/#contact-1",
        // "https://bettystaxservices.com/contact",
        // "https://www.bonaventuredesign.com/contact-us/",
        // "https://ginnyweaver.com/contact/",
        // "https://artc.systems/contact-us/",
        // "https://propylon.com/contact/",
        // "https://www.platecompany.com/index.php/contact",
        // "http://nybbleteksolutions.com/contact-us/",
        // "https://www.morrow-accounting.com/contact",
        // "https://fosteraccountingin.com/contact",
        // "https://systemdomaininc.com/contact.php",
        // "https://www.stablepug.com/#contact",
        // "https://www.mstech-eyes.com/contact-us",
        // "https://newcastleassoc.com/contact-chicago-information-technology-staffing/",
        // "https://amsacct.com/contacts",
        // "http://www.dennisrwencel.com/ContactUs.html",
        // "https://infobankmediaseo.com/contact/",
        // "https://www.cashregisterguys.com/contact.html",
        // "https://www.julieawhelancpallc.com/",
        // "http://www.rangeus.com/contact/", //no form
        // "https://helpdesk.bitrix24.com/ticket.php?ID=0",
        // "https://fedeleandassociates.com/#contact",  //iframe
        // "https://emergingbusinessservices.com/contact/", //no form
        // "https://www.sagebooksinc.com/contact", //no form
        // "https://knowink.com/contact-us/",
        // "https://www.innovativetimingsystems.com/contact-us", // no form
        // "http://corptechs.com/contact-us.aspx", //no form
        // "http://hmscpa.com/contact-us/",    //no form
        // "https://mackmediallc.com/#contact-us", //contains custom captcha. nameattr of captcha is quiz
        // "https://triafed.com/contact-us/", 
        // "https://designbratzleadville.com/contact",
        // "https://quantale.io/#contact",                 //pass
        // "http://coswebsiteservices.com/contact.html",       //pass
        // "https://www.sms360.com/",      //company name is textareea  //form in footer
        // "https://www.rydzikcpa.com/contact",
        // "https://www.biginternet.co.uk/contact/", // np form
        // "http://alpineaccountingservices.com/contact/",     //contains question wihtout captcha
        // "https://www.mjpenistoncpa.com/contact-us",         //pass
        // "https://www.feiscocpa.com/contact",            //no form
        // "http://www.moviltrack.com/contacto.html"    //non english site //submut button text is "Eviar" (language is spanish)
        // "https://exellqstaffing.com/contact-us/",
        // "https://financialstaffers.biz/search-for-a-job/contact",
        // "https://firstoptionws.com/contact/",
        // "https://fitstaffingsolutions.com/it-employment-agency/",
        // "https://flashpointpersonnel.com/contact/",
        // "https://flemingtr.com/contact-us/",
        // "https://footbridgecompany.com/contact-us/",
        // "https://form4solutions.com/contact/",
        // "https://fortress.wa.gov/esd/file/ContactUS/AccessibilityForm/BarrierReportForm?language=en",
        // "https://fountainheadbusinesssolutions.com/contact-us",
        // "https://fpcnational.com/contact/",
        // "https://fpcnational.com/fpc/arlington-heights/#!contact",
        // "https://franklinprofessionals.com/hire-talent",
        // "https://freeeducationstaffing.org/contact/",
        // "https://fssstaff.com/contact/#locations",
        // "https://furststaffing.com/contact/",
        // "https://futureofworkexchange.com/contact/",
        // "https://gcgeventpartners.com/contact-us/get-a-quote/",
        // "https://gemstatestaffingjobs.com/contact/",
        // "https://global-staffingsolutions.com/contact.php",
        // "https://goodwillches.org/contact-us/",
        // "https://gotoworkonenw.com/contact-us",
        // "https://gotworxstaffing.com/contact/",
        // "https://greatstaffllc.com/contact-us/",
        // "https://gtrjobs.com/contact-us/",
        // "https://hcrnetwork.com/contact/",
        // "https://healthcarejobs.net/contact-us-2/",
        // "https://helpconsultingservices.com/contact",
        // "https://henryelliott.com/contact-us/",
        // "https://heramanagementllc.com/contact-page/",
        // "https://hiredynamics.com/contact/",
        // "https://hireinitiatives.com/contact",
        // "https://hireonestaffing.com/contact/",
        // "https://hirepremrose.com/contact-us/",
        // "https://hirequest.com/contact-us/",
        // "https://hirestandard.com/contactus/",
        // "https://hireuc.com/contact/",
        // "https://hoodcontainer.com/contact-us/",
        // "https://horizongoodwill.org/contact/",
        // "https://horizonhouseperu.org/contact/",
        // "https://householdstaffing.com/about-us/contact-us/",
        // "https://hrsolutions.net/contact-us/",
        // "https://hughesresources.com/contact-us/",
        // "https://humanix.com/contact/",
        // "https://ibcins.biz/contact/",
        // "https://idealsolutionsinsurance.com/contact-us/",
        // "https://idealstaffinggroup.com/contact-us/",
        // "https://ighcp.com/ebs/contact-us/",
        // "https://imagestaffingkc.com/contact/",
        // "https://immediateconnections.com/contact-us/",
        // "https://innovatedstaffing.com/contact/",
        // "https://inquirehire.com/about/contact",
        // "https://isentcare.com/contact/",
        // "https://isprnet.org/contact-us/",
        // "https://itgllc.net/contacts/",
        // "https://j-galt.com/contact-us/",
        // "https://jaspengroup.com/contact/",
        // "https://jencor.com/contact/",
        // "https://jleusa.com/contact/",
        // "https://jobandtalent.com/#",
        // "https://jobexchangeinc.org/contacts/",
        // "https://jobpoststaffing.org/contact-us/",
        // "https://jobsocietydc.com/contact-us/",
        // "https://jobsourceusa.com/contact/",
        // "https://johnsonresources.com/contact-us/",
        // "https://joycareagency.com/contacts/",
        // "https://jskrecruiting.com/contact/",
        // "https://kcsyndeo.com/contact/",
        // "https://kindstaffinggroup.com/contact-us",
        // "https://klrsearchgroup.com/about/contact",
        // "https://kmahr.com/contact/",
        // "https://ksworkforceone.org/contact/",
        // "https://labpersonnel.com/search-for-a-job/contact",
        // "https://lafayette.snelling.com/contact/",
        // "https://lavora.ca/contact/",
        // "https://lawrencestaffingservice.com/contact-us/",
        // "https://leddygroup.com/get-hired/contact-a-staffing-manager/",
        // "https://lgcassociates.com/contact-us/",
        // "https://lifeworksarc.org/contact-us/",
        // "https://lifeworksearch.com/contact/",
        // "https://lollgroup.com/contact",
        // "https://louisville.snelling.com/contact/",
        // "https://lsistaffing.com/contact",
        // "https://ltchealthstaffing.com/contact/",
        // "https://maakaygroup.com/contact/",
        // "https://managedcarestaffers.com/search-for-a-job/contact",
        // "https://manpowerab.com/contact-us/",
        // "https://manpowernorthernillinois.com/contact-us/",
        // "https://marchonpartners.com/contact-us",
        // "https://masisstaffing.com/contact",
        // "https://masshire-msw-youth.org/contact/",
        // "https://masshiregreaternewbedford.com/contact/",
        // "https://masshireholyoke.org/contact/",
        // "https://masshiremetronorth.org/contact/",
        // "https://masshiremvcc.com/contact/",
        // "https://mbstaffing.com/#contact-us",
        // "https://medcallstaffing.com/contact-us/",
        // "https://medicushcs.com/#contactUsForm",
        // "https://medsolutionspro.com/contact-us/",
        // "https://medstl.com/contact-us/",
        // "https://mercistaffing.org/contact.html",
        // "https://metricstechnology.us/contact-us/",
        // "https://midwaystaffing.com/contact-us",
        // "https://midwestprofessionalstaffing.com/contact/",
        // "https://midwestsos.com/contact-us",
        // "https://miscstaffing.com/contact-2/",
        // "https://moorestaffing.com/contact-us-moore-staffing-services/",
        // "https://moralesgroup.net/contact/",
        // "https://motentate.com/contact-us/",
        // "https://myhouseholdmanaged.com/contact-us",
        // "https://mylegale.com/contact/",
        // "https://nannypoppinsagency.com/#contact",
        // "https://needanurseidaho.com/contact/",
        // "https://neinworks.org/contact/",
        // "https://networks-connect.com/#Contact",
        // "https://newagesoft.com/contact-us/",
        // "https://neworleanstempagency.com/contact/",
        // "https://newresource-group.com/contact/",
        // "https://nexusemployment.com/locations-and-contact/locations-and-contact",
        // "https://nkcareercenter.org/contactpage/",
        // "https://nola.gov/workforce-development/hire-nola/contact-us/",
        // "https://northbridgestaffing.com/contact/",
        // "https://northernindiana.snelling.com/contact/",
        // "https://novanela.org/contact-nova/",
        // "https://nstalentsolutions.com/contact",
        // "https://omaha.snelling.com/contact/",
        // "https://ondemandstaffing.com/contact/",
        // "https://onesourcelabor.com/contact-us/",
        // "https://onstaffusa.com/contact/",
        // "https://ontargetstaffingllc.com/contact/",
        // "https://optimumperm.com/contact-us/",
        // "https://ossa-llc.com/contact/",
        // "https://palmer-staffing.com/contact",
        // "https://partnershipemployment.com/contact-us/",
        // "https://peoplefirststaffing.com/contact-us/",
        // "https://permanentworkers.com/contact-us/",
        // "https://personnelplusinc.com/contact-us/",
        // "https://personnelpreference.com/index.php/contact-us",
        // "https://phoenixstaffinginc.com/contact-us/",
        // "https://pics.bc.ca/about-us/contact-us/",
        // "https://pinnacle-staff.com/contact-form-employer-services/",
        // "https://pinnacle.jobs/contact/",
        // "https://placestaffing.com/contact/",
        // "https://plistaffing.com/contact-us/",
        // "https://polymer-specialties.com/contact/",
        // "https://ppincjobs.com/contact-us/",
        // "https://ppsemployment.com/contact/",
        // "https://premierveterans.com/contact/",
        // "https://premiumeventstaffing.com/illinois/contact-us/",
        // "https://proplacementusa.com/contact/",
        // "https://proservicesinc.com/contact-1",
        // "https://prostartinc.com/contact-us/",
        // "https://protradestaffing.com/contact-us/",
        // "https://protrans.ca/en/contact/",
        // "https://provenirhealthcare.com/contact-us/",
        // "https://provisional.com/contact-provisional-recruiting/",
        // "https://proviso.ca/contact-proviso/",
        // "https://psiresourcesinc.com/psi-contact-us/",
        // "https://pyramidci.com/contact-us/",
        // "https://qls1.com/contact",
        // "https://qsl.com/info/",
        // "https://raymondsearchgroup.com/contact-us/",
        // "https://realtime-inc.com/#contactSec",
        // "https://recruitinginmotion.ca/hiring-consultants-canada/",
        // "https://reliablestaffing.com/contact/",
        // "https://ren-network.com/contact/",
        // "https://resourceemployment.com/?loc=stlouis#contact-form",
        // "https://resourceemployment.com/#contact-form",
        // "https://responserecruitment.co.uk/contact-information/",
        // "https://restartnow.ca/contact/",
        // "https://rhmstaffing.net/contact/",
        // "https://right-resources.com/contact/",
        // "https://riseservicesincid.org/contact/",
        // "https://rootsstaffing.com/#popup",
        // "https://rpservices.net/contact-us/",
        // "https://ruralresources.org/contact/",
        // "https://saleminc.com/contact-us/",
        // "https://scientificsearch.com/contact-us/",
        // "https://searchstaffing.net/contact/",
        // "https://securestaffing.net/contact-us/",
        // "https://sedonaagservices.com/contact",
        // "https://sercorporation.com/contact-3",
        // "https://sevitahealth.com/contact-us/",
        // "https://sfi-ohio.com/contact",
        // "https://sharpmedicalstaffing.com/client-contact-request/",
        // "https://shoregroupllc.com/contact-us/",
        // "https://shoreup.org/contact-us/",
        // "https://sigmainc.com/contact/",
        // "https://signaturestaffing.info/contact/",
        // "https://siue.edu/contact/index.shtml",
        // "https://skillwork.com/contact-us/",
        // "https://skywalkglobal.net/contact/",
        // "https://smalltownstaffing.com/contact.php",
        // "https://smartstaffinginc.com/contact/",
        // "https://smith1903.com/protective-clients/protective-contact-locations/",
        // "https://smsstaffing.com/contact-us",
        // "https://snapchef.com/locations/",
        // "https://snider-blake.com/contact/",
        // "https://soaltech.com/contact-us/",
        // "https://solidaritystaffing.com/contact/",
        // "https://sophlogic.com/contact.php",
        // "https://sourceithawaii.com/contact.html",
        // "https://southlandemployment.com/contact/",
        // "https://speconthejob.com/contact/",
        // "https://spemploys.com/contact-us/",
        // "https://sprrecruitment.com/contact-us/",
        // "https://ssslabor.com/contact-us.html",
        // "https://staff-force.com/contact/",
        // "https://staffing.volt.com/contact",
        "https://staffingnetwork.com/contact-us/",
        "https://staffingtogether.com/contact-us/",
        "https://staffmg.com/contact/",
        "https://staffmidamerica.com/employers/contact-employers/",
        "https://staffnowjobs.com/contact/",
        "https://staffonsite.com/contact-us/",
        "https://staronemadison.com/personnel-connection.net/php/contact-us/contact.php",
        "https://startrecruitingandtraining.com/contactus",
        "https://stivers.com/contact-us/",
        "https://stlouis.snelling.com/contact/",
        "https://stolengroundmedia.com/contact/",
        "https://strategicemployment.com/contact-us/",
        "https://summitcareersinc.com/contact-us",
        "https://sunconcierge.com/contact-us/",
        "https://support.google.com/mail/contact/abuse?sjid=15258850913618296138-NA",
        "https://surgestaffing.com/locations/Anderson-IN?utm_source=gmb&utm_medium=yext#myModal",
        "https://surgestaffing.com/locations/Bloomington-IN?utm_source=gmb&utm_medium=yext#myModal",
        "https://surgestaffing.com/locations/Calumet%20City-IL?utm_source=gmb&utm_medium=yext#myModal",
        "https://surgestaffing.com/locations/Clarksville-IN?utm_source=gmb&utm_medium=yext#myModal",
        "https://surgestaffing.com/locations/Elizabethtown-KY#myModal",
        "https://surgestaffing.com/locations/Florence-KY?utm_source=gmb&utm_medium=yext#myModal",
        "https://surgestaffing.com/locations/Frankfort-KY?utm_source=gmb&utm_medium=yext#myModal",
        "https://surgestaffing.com/locations/Franklin-IN?utm_source=gmb&utm_medium=yext#myModal",
        "https://surgestaffing.com/locations/Granite%20City-IL?utm_source=gmb&utm_medium=yext#myModal",
        "https://surgestaffing.com/locations/Hagerstown-MD?utm_source=gmb&utm_medium=yext#myModal",
        "https://surgestaffing.com/locations/Indianapolis-IN#myModal",
        "https://surgestaffing.com/locations/Joliet-IL?utm_source=gmb&utm_medium=yext#myModal",
        "https://surgestaffing.com/locations/Louisville-KY?utm_source=gmb&utm_medium=yext#myModal",
        "https://surgestaffing.com/locations/Louisville-KY#myModal",
        "https://surgestaffing.com/locations/Phoenix-AZ#myModal",
        "https://surgestaffing.com/locations/Shepherdsville-KY?utm_source=gmb&utm_medium=yext#myModal",
        "https://surgestaffing.com/locations/St.%20Ann-MO?utm_source=gmb&utm_medium=yext#myModal",
        "https://surgestaffing.com/locations/Swansea-IL#myModal",
        "https://sustainablestaffinginc.com/contact-us/",
        "https://suzyvance.com/#contact",
        "https://swinworkforce.org/contact-us/",
        "https://synergystaffingllc.com/contact/",
        "https://systemone.com/contact/",
        "https://talentbridge.com/contact/",
        "https://talentfill.com/contact/",
        "https://talentporte.com/contact/",
        "https://talentyo.com/Contact",
        "https://tanganyikanetwork.com/contact-us/",
        "https://tasctech.com/contact/",
        "https://tastaffing.com/contact-temp-agency/",
        "https://teamedforlearning.com/contact-us/",
        "https://teamsoftinc.com/contact-us/",
        "https://teamworkforce.com/contact/",
        "https://techprosinc.com/call-email-connect/",
        "https://techrakers.com/contact-us/",
        "https://techstaff.com/?page_id=565",
        "https://techstarconsulting.com/contact-us/",
        "https://teknavigators.com/contact/",
        "https://teleprogroup.com/contact-us/",
        "https://tempsservices.ca/contact/",
        "https://theceigroup.com/contact/",
        "https://thechoiceinc.com/contact-us/",
        "https://thedealiomarketing.com/contact/",
        "https://thehire.com/contact/",
        "https://themidtowngroup.com/contact/",
        "https://totalcaremedicalstaffing.com/contact-us/",
        "https://tradesource.com/contact-us/",
        "https://trayceehomecare.com/Contact-Us",
        "https://triagestaff.com/contact/",
        "https://trilliumstaffing.com/hire/contact/",
        "https://trimensolutions.com/contact/",
        "https://tritonstaffing.com/contact/",
        "https://twinc.com/ja/contact/",
        "https://unistaffjobs.com/contact-us/",
        "https://upliftmaine.org/contact/",
        "https://utalent.com/contact/",
        "https://v3recruitment.com/contact",
        "https://vernonlong.wixsite.com/opp4all",
        "https://visitgoodwill.com/contact/",
        "https://washburnagency.com/contact-us/",
        "https://wellsenterprisesinc.com/ask-wells",
        "https://westernmarylandconsortium.org/contact-us",
        "https://willmott.com/hr-contract-placement-contact/",
        "https://wisemedicalstaffing.com/contact-us/",
        "https://work-now.com/contact/",
        "https://workers.com/contact-us/",
        "https://workforcecenters.com/workforce-centers/",
        "https://workforceinnovationcenter.com/contact/",
        "https://workforcepartnership.com/contact/",
        "https://workingfields.com/contact.php",
        "https://worknetbatavia.com/contact/",
        "https://workopportunities.net/about-us/contact-us/",
        "https://worksourcemontgomery.com/contact/",
        "https://wrstaffingllc.com/contact/",
        "https://www.1sri.com/contact-us/",
        "https://www.1stoprecruiting.com/contact-us/",
        "https://www.365personnel.com/contact-us",
        "https://www.4tssi.com/contact-us/",
        "https://www.able.jobs/temporary-staffing-solutions/",
        "https://www.abrjobs.com/contact-us/",
        "https://www.academicdiversitysearch.com/contact-us/",
        "https://www.accustaffingagency.com/contact",
        "https://www.acnemploy.com/contact-us",
        "https://www.actalentservices.com/en/contact-us",
        "https://www.actioncoach.com/contact/",
        "https://www.actionlogistix.com/contact",
        "https://www.adc-ms.com/contact",
        "https://www.addstaffinc.com/contact-us/",
        "https://www.adkissonconsultants.com/contact/",
        "https://www.advancedqs.com/contact",
        "https://www.advancedresources.com/contact-us/",
        "https://www.advanceservices.com/contact-us/",
        "https://www.advantagelaborsolutions.com/contact-us/",
        "https://www.advocatehealthstaffing.com/contact",
        "https://www.aerotek.com/en/contact-us",
        "https://www.ag1source.com/contact-us/",
        "https://www.agilewps.com/contact-us/",
        "https://www.aheadhr.com/contact-us/",
        "https://www.aheadstaffingbg.com/contact/",
        "https://www.alexandertg.com/contact/",
        "https://www.allegiancestaffing.com/contact-us/",
        "https://www.allfieldssolutions.net/contact-us/",
        "https://www.allianceworkforcekc.com/contact-us/",
        "https://www.allsearchinc.com/sales-recruitment-companies/",
        "https://www.allstaffcareers.com/contact-us/",
        "https://www.allstaffcares.com/contact-us/",
        "https://www.allstaffnurses.com/contact",
        "https://www.allstaffsc.com/contact-us",
        "https://www.allstarconnections.com/contact-us/",
        "https://www.allswell.com/contact.aspx",
        "https://www.alltempservicesinc.com/contact-us.html",
        "https://www.alltradestemp.com/staffing-agency-utah/",
        "https://www.alphastaffinginc.com/contact-us",
        "https://www.alstaffingagency.com/",
        "https://www.altastaff.com/contact-us",
        "https://www.altstaff.com/temp-agencies-chicago/",
        "https://www.alva-agency.com/contact/",
        "https://www.anodyne-services.com/contact-us/",
        "https://www.apexemploymentservices.com/contact",
        "https://www.apexsystems.com/contact-us",
        "https://www.apollopros.com/contact/",
        "https://www.apollotechnical.com/contact-us/",
        "https://www.appleone.com/contact.aspx",
        "https://www.appleseedpersonnel.com/contact-us/",
        "https://www.approachpeople.com/contact",
        "https://www.apstemps.com/contact-automation-personnel-services/",
        "https://www.arcgonline.com/contact-us/#recruitment_sec/",
        "https://www.arcstaffingsolutions.com/contact-springfield",
        "https://www.army.mil/contact",
        "https://www.asapstaffing.com/contact/",
        "https://www.asinational.com/contact/",
        "https://www.associatedstaffing.biz/contact-us/",
        "https://www.assuredhealthcare.com/contact-us-for-help",
        "https://www.astoncarter.com/en/about-us/contact-us",
        "https://www.athumanresources.com/contact/",
        "https://www.atlasemployment.com/atlas-employment-service-contact",
        "https://www.atr.com/contact-us",
        "https://www.atticusrecruiting.com/contact/",
        "https://www.atwork.com/contact",
        "https://www.atworksocal.com/index.php/contact-us",
        "https://www.austintec.com/contact/",
        "https://www.australasian.co.uk/contact-us/",
        "https://www.avant.jobs/contact/",
        "https://www.avanti-staffing.com/contact-us/",
        "https://www.aventure.com/contact-us/",
        "https://www.axcessjobs.com/transportation-logistics-jobs/",
        "https://www.axiomstaffing.com/contact/",
        "https://www.backbaystaffinggroup.com/contact-us",
        "https://www.backgroundsource.com/Htdocs/contacts.html",
        "https://www.bannerpersonnel.com/contact-banner-personnel/",
        "https://www.barclaypersonnel.com/contact.php",
        "https://www.bartonstaffing.com/contact-us/",
        "https://www.bcsplacement.com/contact/",
        "https://www.bdemploymentidaho.com/contact",
        "https://www.bealepersonnel.com/contact",
        "https://www.bemana.us/contact/",
        "https://www.besthomecareandstaffing.com/contact-us",
        "https://www.bhc.edu/about-us/contact-us/",
        "https://www.bjstempservice.com/contact",
        "https://www.bostoncontemporaries.com/contact/",
        "https://www.bostonnanny.com/contact/",
        "https://www.brilliantfs.com/contact/",
        "https://www.bristaffing.com/contact-us/",
        "https://www.brooksource.com/contact",
        "https://www.cabildostaffing.com/contact-us/",
        "https://www.candcconsultants.com/contact",
        "https://www.cardinalstaffing.com/contact-us/",
        "https://www.careercentre.org/contact/",
        "https://www.careerchoicestaffing.com/contact",
        "https://www.careercoaching4u.com/contact.asp",
        "https://www.careercontacts.ca/",
        "https://www.careertransitionsllc.com/placement-services/",
        "https://www.carheel.com/",
        "https://www.cata-farmworkers.org/contact",
        "https://www.ccistaff.com/contact-us/",
        "https://www.cdaedc.org/contact",





    ]
};
