$(document).ready(async () => {
	var cardColumnCount = 2;
	$("#btnArtFilter").click(() => {
		$(".filter-btns button").removeClass("active");
		$("#btnArtFilter").addClass("active");
		$(".cs-card").hide();
		$(".art-card").show();
	});
	$("#btnCSFilter").click(() => {
		$(".filter-btns button").removeClass("active");
		$("#btnCSFilter").addClass("active");
		$(".art-card").hide();
		$(".cs-card").show();
	});
	$("#btnBothFilter").click(() => {
		$(".filter-btns button").removeClass("active");
		$("#btnBothFilter").addClass("active");
		$(".cs-card").show();
		$(".art-card").show();
	});
	$("#refreshCommitsBtn").click(async () => {
		$("#refreshCommitsBtn").find("i").css("animation","spin 1s linear infinite");
		//yes I realize that this is not a good thing to do. I figured it was safe in a private repository though.
		try {
			commits = await getCommits(USERNAME,PASSWORD);
			showCommits(commits);
		}
		catch(e) {
			console.log("no user login info present");
		}
		$("#refreshCommitsBtn").find("i").css("animation","none");
	});

	function addCards(holder, cardData, colAmt) {
		$(holder).empty();
		var rowIndex = 0;
		for(let i = 0; i < cardData.length; i++) {
			if(i % colAmt == 0) {
				$("<div>").addClass("row").appendTo(holder);
				rowIndex++;
			}
			let currentRow = $(holder).children(".row").eq(rowIndex-1);
			$("<div>")
			.addClass("col-md-"+(12/colAmt))
			.addClass(cardData[i].cardType+"-card")
			.html(
				`<div class='card ${(cardData[i].cardType == 'cs' ? 'bg-primary' : 'bg-success')} my-3'>`
				+`<div class='card-header'>`
				+`<h5>${cardData[i].classNumber}</h5>`
				+`<h6>${cardData[i].className}</h6>`
				+`</div>`
				+`<div class='card-body'>`
				+`<button class='btn btn-block btn-dark' data-toggle='collapse' data-target='#card${cardData[i].classNumber}info'>`
				+`Details`
				+`</button>`
				+`<div class='card bg-info collapse p-2' id='card${cardData[i].classNumber}info'>`
				+cardData[i].info
				+`</div>`
				+`</div>`
				+`<div class='card-footer'>`
				+`<p class='text-right'>${cardData[i].dateTaken}</p>`
				+`</div>`
			)
			.appendTo(currentRow);
		}
	}

	function filterCards() {
		$(".filter-btns button").each((i, button) => {
			if($(button).hasClass("active")) {
				if($(button).attr("id") == "btnArtFilter") {
					$(".cs-card").hide();
					$(".art-card").show();
				}
				else if($(button).attr("id") == "btnCSFilter") {
					$(".art-card").hide();
					$(".cs-card").show();
				}
				else if($(button).attr("id") == "btnBothFilter") {
					$(".art-card").show();
					$(".cs-card").show();
				}
			}
		});
	}

	function getUserInfo(username) {
		return new Promise((resolve,reject) => {
			$.ajax({
				url: "https://api.github.com/users/"+username,
				dataType: 'json',
				success: (data) => {
					resolve(data);
				},
				error: (jqXHR, textStatus) => {
					reject(textStatus);
				}
			});
		});   
	}

	function setUserDisplay(userData) {
		$("<div>").attr({
			"class":"card bg-dark my-3"
		})
		.html(
		`<div class='card-header'>`
		+`<h3 class='display-4'><a href='${userData.html_url}' target='_blank'>${userData.login}</a></h3>`
		+`<p class='lead'><span class='font-weight-bold'>Bio</span>: `
		+userData.bio
		+`</div>`
		+`</div>`
		+`<div class='card-body'>`
		+`<table class='table table-dark'>`
		+`<tr>`
		+`<td class='font-weight-bold'>Location</td>`
		+`<td>${userData.location}</td>`
		+`</tr>`
		+`<tr>`
		+`<td class='font-weight-bold'>Public Repos</td>`
		+`<td>${userData.public_repos}</td>`
		+`</tr>`
		+`<tr>`
		+`<td class='font-weight-bold'>Hireable</td>`
		+`<td>${userData.hireable ? "<i class='fas fa-check'></i>" : "<i class='fas fa-times'></i>"}</td>`
		+`</tr>`
		+`</table>`
		+`</div>`
		+`</div>`
		).appendTo("#userInfoHolder");
	}

	addCards($("#classCards"),cardData,2);

	$("#columnSlider").on("input",() => {
		let newValue = $("#columnSlider").val();
		$("#columnCount").text(newValue);
		$(".cs-card, .art-card").removeClass("col-md-"+cardColumnCount);
		cardColumnCount = newValue;
		$(".cs-card, .art-card").addClass("col-md-"+cardColumnCount);
		addCards($("#classCards"),cardData,cardColumnCount);
		filterCards();
	});

	function getCommits(username,password) {
		return new Promise((resolve,reject) => {
			$.ajax({
				url:"https://api.github.com/repos/wou-cs/CS460-F19-thill7/commits",
				dataType: 'json',
				beforeSend: (xhr) => {
					xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
				},
				success: (data) => {
					resolve(data);
				},
				error(jqXHR,textStatus) {
					reject(textStatus);
				}
			});
		});
	}

	function showCommits(commits) {
		$("#commitHolder").empty();
		var rowIndex = 0;
		var colAmt = 2;
		for(let i = 0; i < commits.length; i++) {
			if(i % colAmt == 0) {
				$("<div>").addClass("row").appendTo("#commitHolder");
				rowIndex++;
			}
			let currentRow = $("#commitHolder").children(".row").eq(rowIndex-1);
			$("<div>")
			.addClass("col-md-"+(12/colAmt))
			.html(
				`<div class='card bg-dark my-3'>`
				+`<div class='card-header'>`
				+`<h3>repo: /wou-cs/CS460-F19-thill7/</h3>`
				+`</div>`
				+`<div class='card-body'>`
				+`<div class='row'>`
				+`<div class='col-9'>`
				+`<dl>`
				+`<dt>`
				+`<h3><span class='text-info'>Commiter</span>: <a href='${commits[i].author.html_url}'>${commits[i].commit.committer.name}</a></h3>`
				+`</dt>`
				+`<dd>`
				+`<p class='py-2'><span class='text-info text-lead'>Message</span>: ${commits[i].commit.message}</p>`
				+`</dd>`
				+`</dl>`
				+`</div>`
				+`<div class='col-3'>`
				+`<img src='${commits[i].author.avatar_url}' class='img-fluid img-thumbnail mx-auto d-block' />`
				+`</div>`
				+`</div>`
				+`</div>`
				+`<div class='card-footer'>`
				+`<p class='text-right'>${commits[i].commit.author.date}</p>`
				+`</div>`
			)
			.appendTo(currentRow);
		}
	}
	//yes I realize that this is not a good thing to do. I figured it was safe in a private repository though.
	try {
		var commits = await getCommits(USERNAME,PASSWORD);
		showCommits(commits);
	}
	catch(e) {
		console.log("no user login info present");
	}
	setUserDisplay(await getUserInfo('thill7'));
});
