/*
 * 文件分段上传jquery插件
 * author:lovefc
 * time:2018/01/05 23:05
 */
(function (jQuery) {
	jQuery.fn.fcupInitialize = function () {

		return this.each(function () {

			var button = jQuery(this),
			fcup = 0;
			if (!jQuery.uploading) {
				jQuery.uploading = '上传中...';
			}
			if (!jQuery.upfinished) {
				jQuery.upfinished = '上传完成';
			}
			var options = jQuery.extend({
					loading: jQuery.uploading,
					finished: jQuery.upfinished
				}, button.data());

			button.attr({
				'data-loading': options.loading,
				'data-finished': options.finished
			});
			var bar = jQuery('<span class="tz-bar background-horizontal">').appendTo(button);
			button.on('fcup', function (e, val, absolute, finish) {

				if (!button.hasClass('in-fcup')) {
					bar.show();
					fcup = 0;
					button.removeClass('finished').addClass('in-fcup')
				}
				if (absolute) {
					fcup = val;
				} else {
					fcup += val;
				}

				if (fcup >= 100) {
					fcup = 100;
					jQuery.upstr = options.finished;
					jQuery.fcup_add();
				}

				if (finish) {

					button.removeClass('in-fcup').addClass('finished');

					bar.delay(500).fadeOut(function () {
						button.trigger('fcup-finish');
						setProgress(0);
					});

				}

				setProgress(fcup);
			});

			function setProgress(percentage) {
				bar.filter('.background-horizontal,.background-bar').width(percentage + '%');
				bar.filter('.background-vertical').height(percentage + '%');
			}

		});

	};

	jQuery.fn.fcupStart = function () {

		var button = this.first(),
		last_fcup = new Date().getTime();

		if (button.hasClass('in-fcup')) {
			return this;
		}

		button.on('fcup', function () {
			last_fcup = new Date().getTime();
		});

		var interval = window.setInterval(function () {

				if (new Date().getTime() > 2000 + last_fcup) {

					button.fcupIncrement(5);
				}

			}, 500);

		button.on('fcup-finish', function () {
			window.clearInterval(interval);
		});

		return button.fcupIncrement(10);
	};

	jQuery.fn.fcupFinish = function () {
		return this.first().fcupSet(100);
	};

	jQuery.fn.fcupIncrement = function (val) {

		val = val || 10;

		var button = this.first();

		button.trigger('fcup', [val])

		return this;
	};

	jQuery.fn.fcupSet = function (val) {
		val = val || 10;

		var finish = false;
		if (val >= 100) {
			finish = true;
		}

		return this.first().trigger('fcup', [val, true, finish]);
	};

})(jQuery);

var big_upload = {

	fcup: function (config) {
		jQuery.extend(config);
		if (!jQuery.upstr) {
			jQuery.upstr = '上传文件';
		}
		if(!jQuery.upid){
			jQuery.upid = 'ad47494fc02c388e';
		}
		if (jQuery.updom && jQuery.upurl) {
			jQuery.fcup_add();
		}
	},

	fcup_add: function () {
		var html = '<div class="fcup-button">';
		html += jQuery.upstr;
		html += '<input type="file" id="'+ jQuery.upid +'" onchange="jQuery.big_upload()" style="position:absolute;font-size:100px;right:0;top:0;opacity:0;">';
		html += '</div>';
		jQuery(jQuery.updom).html(html);
	},
	fc_GetPercent: function (num, total) {
		num = parseFloat(num);
		total = parseFloat(total);
		if (isNaN(num) || isNaN(total)) {
			return "-";
		}
		return total <= 0 ? 0 : (Math.round(num / total * 10000) / 100.00);
	},

	big_upload: function () {
		jQuery('.fcup-button').fcupInitialize();
		var controlButton = jQuery('.fcup-button');
		var width = controlButton.outerWidth(true);
		var result = '';
		var file = jQuery('#'+jQuery.upid)[0].files[0],

		name = file.name,

		size = file.size,

		index1 = name.lastIndexOf(".");

		index2 = name.length,

		suffix = name.substring(index1 + 1, index2);
		if (!jQuery.shardsize) {
			jQuery.shardsize = 2;
		}
		var shardSize = jQuery.shardsize * 1024 * 1024,

		succeed = 0;

		shardCount = Math.ceil(size / shardSize);

		if (jQuery.uptype) {
			if (!jQuery.errtype) {
				jQuery.errtype = '文件类型不对';
			}
			uptype = jQuery.uptype.split(",");
			if (jQuery.inArray(suffix, uptype) == -1) {
				jQuery.upstr = jQuery.errtype;
				jQuery.fcup_add();
				return false;
			}
		}

		for (var i = 0; i < shardCount; ++i) {

			var start = i * shardSize,

			end = Math.min(size, start + shardSize);

			var form = new FormData();

			form.append("file_data", file.slice(start, end));

			form.append("file_name", name);

			form.append("file_total", shardCount);

			form.append("file_index", i + 1);
			
			jQuery.ajax({
				url: jQuery.upurl,
				type: "POST",
				data: form,
				async: true,
				processData: false,
				contentType: false,
				success: function (result) {
					if(typeof jQuery.upcallback == 'function'){
					    jQuery.upcallback(result);
					}else{
						console.log(result);
					}
					++succeed;
					var cent = jQuery.fc_GetPercent(succeed, shardCount);
					console.log(cent + '%');
					controlButton.fcupSet(cent);
				}
			});

		}

	}

};
(function (jQuery) {
	jQuery.extend(big_upload);
})(jQuery);