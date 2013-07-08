$(function(){
	var $datepicker = $('#datepicker').datepicker();
	
	var gutter = 5,
		nSplashes = 1440 / gutter,	// minutes divided by 5 of a day
		nHalf = nSplashes / 2;
	var time = nHalf;
	var $showtime = $('#showtime');
	var $slider = $('#slider');
	$slider.slider({
		range: "min",
		value: time,
		min: 0,
		max: nSplashes - 1,
		create: function(ev, ui) {
			updateTime(time);
		},
		slide: function(ev, ui) {
			updateTime(ui.value);
		}
	});
	function updateTime(n){
		var str = parseTimeStr(time = n * gutter);
		$showtime.text(str);
	}
	function parseTimeStr(time){
		var h = parseHours(time),
			i = parseMinutes(time);
		return (h < 10? '0': '') + h + ':' + (i < 10? '0': '') + i;
	}
	function parseHours(time){
		return Math.floor(time / 60);
	}
	function parseMinutes(time){
		return Math.floor(time % 60);
	}
	
	//var regCn = /^[\u4e00-\u9fa5]$/;
	var regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;	// en email
	regEmail = new RegExp(
		regEmail.toString().replace(/^\//, '').replace(/\/$/, '')
			.replace(/\\w/g, '(\\w|[\\u4e00-\\u9fa5])')
	);	// support cn email
	var errmsgs = ['信息不完整', 'Email格式不正确'];
	var $form = $('#form');
	$form.on('submit', function(ev){
		var to = $('#email').val();
		if (! regEmail.test(to)) {
			alert(errmsgs[1]);
			return false;
		}
		var subject = $('#subject').val(),
			text = $('#content').val();
		var date = $datepicker.datepicker('getDate');
		date.setHours(parseHours(time));
		date.setMinutes(parseMinutes(time));
		
		var data = {
			to: to,
			subject: subject,
			text: text,
			when: date.toString()
		}
		console.log(data);
		$.post('/send', data, function(res){
			console.log(res);
			if (res.ok) {
				disableForm();	// disable all
				alert('发送成功');
			} else {
				alert(errmsgs[res.err - 1]);
			}
		});
		
		return false;
	});
	function disableForm(){
		$form.find('input, textarea, button').attr('disabled', true);
		$datepicker.datepicker('disable');
		$slider.slider('disable');
	}
});
