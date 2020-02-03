var stops = [] //array johon kerätään asemalle pysähtyvien junien tiedot
var asc = "" //muuttuja aseman lyhytkoodille
var url = "https://rata.digitraffic.fi/api/v1/metadata/stations"  //haetaan asemalistaus
var xmlhttp = new XMLHttpRequest()
xmlhttp.open("GET", url, true)
xmlhttp.send()
xmlhttp.onreadystatechange = function () {
	if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		asemat = JSON.parse(xmlhttp.responseText)
		console.log(asemat)
		asemat.forEach(function(item) {
			if (item.passengerTraffic == true) {
				$('#lista').append('<option value="'+item.stationName+'">'+item.stationName+'</option>')	
			}
		})
		$('#asemat').focus()
	}
}
$(function() {
	$('#asemat').blur(function() {
		var i = this.value
		asemat.forEach(function(item) {
			if (item.stationName === i) {
				asc = item.stationShortCode	
			}
		})	
   	console.log("aseman koodi --> " + asc + " aseman nimi --> " + i)
   	$('.search').html(i)
		var xmlhttp = new XMLHttpRequest()
		url = "https://rata.digitraffic.fi/api/v1/live-trains/station/"+asc+"?arrived_trains=0&arriving_trains=100&departed_trains=0&departing_trains=100" //haetaan valitulle asemalle saapuvat junat
		//url = "https://rata.digitraffic.fi/api/v1/live-trains?arrived_trains=0&arriving_trains=100&departed_trains=0&departing_trains=100&station="+asc
		xmlhttp.open("GET", url, true)
		xmlhttp.send()
		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				junat = JSON.parse(xmlhttp.responseText)
				console.log(junat)
				$('#a').html("Lähtöaika<br>")
				$('#r').html("Raide<br>")
				$('#j').html("Juna<br>")
				$('#l').html("Määränpää<br>")
				junat.forEach(function(item) {
					if (!item.commuterLineID) {
						//kaukojunan tunnus
						j=item.trainType+" "+item.trainNumber
					} else {
						//lähijunan tunnut
						j=item.commuterLineID
					}
					item.timeTableRows.forEach(function(item) {
						if (item.stationShortCode == asc && item.type == "DEPARTURE") {
							//junan aikataulun mikainen lähtöaika
							laika = new Date(item.scheduledTime)
							ennuste=null					
							if (item.liveEstimateTime && item.differenceInMinutes > 0) {
								//jos juna on myöhässä
								ennuste = new Date(item.liveEstimateTime)								
							}
							if (item.cancelled == true) {
								//juna peruttu
								//$('#a').html("Peruttu")
								ennuste="Peruttu"
							}					
							//junan lähtöraide
							raide = item.commercialTrack
						}
						//haetaan aikataulun viimeinen asema
						last = item.stationShortCode
					})
					asemat.forEach(function(item) {
						if (item.stationShortCode === last) {
							loppuasema = item.stationName.replace(" asema","")
							if (loppuasema.includes('_(') ) {
								loppuasema = loppuasema.substr(0, item.stationName.indexOf('_'))	
							}
						}		
					})
					stops.push({lahtoaika: laika, ennuste: ennuste, raide: raide, juna: j, loppuasema: loppuasema}) //tuupataan tarvittavat tiedot arrayhin
				})
				stops.sort(function (a,b) {
					return a.lahtoaika > b.lahtoaika //järjestää arrayn lähtöajan mukaan
				})
				stops.forEach(function(item) {
					$('#a').append("<br>"+(item.lahtoaika.getHours()<10?'0':'')+item.lahtoaika.getHours()+":"+(item.lahtoaika.getMinutes()<10?'0':'')+item.lahtoaika.getMinutes())
					if ($.type(item.ennuste) === "string") {
						$('#a').append(" Peruttu")
					} else if (item.ennuste != null) {
						$('#a').append(" ~"+(item.ennuste.getHours()<10?'0':'')+item.ennuste.getHours()+":"+(item.ennuste.getMinutes()<10?'0':'')+item.ennuste.getMinutes()) 
					}
					$('#j').append("<br>"+item.juna)
					$('#r').append("<br>"+item.raide)
					$('#l').append("<br>"+item.loppuasema)
				})	
			}
		}
	})
})
