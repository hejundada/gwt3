var UploadFiles = new Function();

debugger;
UploadFiles.prototype = {
    currSelector: null,
    uploadFilesList: [],  //存储页面的文件ID
    fileCountSize: 0,   //文件总大小
    fileCount: 0,    //文件个数
    type: "",
    delResultFlag: false,   //删除返回标识
    callBackFun: null,
    uploadingFiles:[],
    init: function (type, attachType, sourceId, htmlId) { //type: upload指上传,download指加载,reload既有加载又有上传   attachType:3000指来源会议,3001指来源公告,3002指来源系统  sourceId:业务ID,与attachType对应
    	debugger;
        var temp = this;
        temp.currSelector = htmlId.find("#uploadFiles");
        temp.type = type;
        if (type == "download") {
        	$("#fileUploadLabel").html("会议文件：");
        	$("#fileUploadInfo1").text("附件 ");
        	$("#fileUploadInfo2").text(" 个,（共");
        	$("#fileUploadInfo3").text("）");
            temp.currSelector.find("#selectFile").hide();
            temp.initHtml(attachType, sourceId,type);
        } else if (type == "reload") {
            temp.initHtml(attachType, sourceId,type);
        }
        temp.reloadFileCount();
        temp.bindMethod();
        htmlId.find("#filelist").data("uploading", []);
    },
    reloadFileCount: function () {
        var temp = this;
        debugger;
        temp.currSelector.find("#uploadCountfiles").text(temp.fileCount);
        temp.currSelector.find("#uploadCountSize").text(temp.bytesToSize(temp.fileCountSize));
    },
    bindMethod: function () {
        var temp = this;
        debugger;
        temp.currSelector.find("#selectFile").unbind("click").click(function () {
        	 var did = new Date().getTime();
            temp.currSelector.find("#file_input").append('<input type="file" id="fileToUpload'+did+'" name="fileToUpload" style="display: none;" multiple	/>');
//            temp.currSelector.find("#fileToUpload").unbind("change").change(function () {
//            });

            temp.uploadDeal(did);
            temp.currSelector.find("#fileToUpload"+did).click();            
            console.log('selectFile click --> temp.currSelector.find("#fileToUpload'+did+'").length = '+temp.currSelector.find("#fileToUpload"+did).length);
        });

        temp.currSelector.find(".delFiles").unbind("click").click(function () {  //删除
            var url = "/meet/uploadFile/delFile.do";
            var fileName = $(this).parents(".fjsc").find("input[name='filename']").val();
            var attachment_id = $(this).parents('.fjsc').find("input[name='attachment_id']").val();
            var fileSize = $(this).parents(".fjsc").find("input[name='filesize']").val();
            var data = { attachmentId: attachment_id };
            
            $.ajax({
                type: "POST",
                url: url,
                data: data,
                dataType: "json",
                cache: false,
                async: true,
                success: function (data) {
                    if (data.CODE == 1) {
                        temp.delResultFlag = true;
                        if (temp.callBackFun != null) {
                            temp.callBackFun();
                        }
                    } else {
                        temp.delResultFlag = false;
                        if (temp.callBackFun != null) {
                            temp.callBackFun();
                        }
                    }
                },
                error: function (data) {
                    temp.delResultFlag = false;
                    if (temp.callBackFun != null) {
                        temp.callBackFun();
                    }
                    comm.utils.alert("提示", "删除附件时服务器出现问题", null, null);
                }
            });

            if (temp.delResultFlag) {
                debugger;
                temp.fileCountSize = temp.fileCountSize - parseInt(fileSize);
                temp.fileCount = temp.fileCount - 1;
                temp.reloadFileCount();  //刷新大小和个数
                $(this).parents('.fjsc').remove();
                temp.delResultFlag = false;
            }
        });

        //浮动显示下载 
        temp.currSelector.find(".content-1").hover(function () {
            $(this).children(".txt").stop().animate({ height: "64px" }, 200);
            $(this).find(".txt h3").stop().animate({ paddingTop: "130" }, 550);
            $(this).find(".txt p").stop().show();
        }, function () {
            $(this).children(".txt").stop().animate({ height: "0px" }, 200);
            $(this).find(".txt h3").stop().animate({ paddingTop: "0px" }, 550);
            $(this).find(".txt p").stop().hide();
        });

//        temp.currSelector.find("#fileToUpload").unbind("change").change(function () {
//        });
    },
    initHtml: function (attachType, sourceId,type) {
    	
        var temp = this;
        var url = "/meet/uploadFile/loadFiles.do";
        var data = { attachType: attachType, sourceId: sourceId };
        $.ajax({
            type: "POST",
            url: url,
            data: data,
            dataType: 'json',
            cache: false,
            async: false,
            success: function (data) {
            	debugger;
                if (data.files_list.length>0 || type == "reload") {
                    var cssUrl = CSSURL;
                    var ftpURL = FTPURL;

                    $.each(data.files_list, function (index, obj) {
                        temp.currSelector.find("#filelist").append(temp.loadHtmlFiles(ftpURL, cssUrl, obj.SERVER_PATH, obj.ORIGINAL_NAME, temp.bytesToSize(parseInt(obj.FILE_SIZE)), obj.FILE_SUFFIX, obj.ATTACHMENT_ID, obj.FILE_SIZE));
                        temp.fileCount = temp.fileCount + 1;
                        temp.fileCountSize = temp.fileCountSize + parseInt(obj.FILE_SIZE);
                    });
                    temp.reloadFileCount();
                    temp.bindMethod();
                }else{
                	temp.currSelector.hide();
                }
            },
            error: function (data) {
                comm.utils.alert("提示", "获取数据时发送错误", null, null);
            }
        });
    },
    
    uploadDeal:function(didx) {
    	debugger;
    	var temp = this;
    	temp.currSelector.find("#fileToUpload"+didx).fileupload({
            type: "POST",
            url: "/meet/uploadFile/upload.do",
            dataType: 'json',
            add: function(e,data){
            	debugger;
            	var file=null;
            	var fileSize = 0;
            	if(data.files.length == 0 ){
            		return;
            	}
       	    	file = data.files[0];
       	    	var isIE = /msie/i.test(navigator.userAgent) && !window.opera;      
           	    if (!isIE) { 
           	    	fileSize = data.files[0].size;
           	    }
	           	if(fileSize > 50 * 1024 * 1024){
	           		comm.utils.alert("警告", "单个文件不能超过50MB", null, null);
	           		return false;
	            }else{
	            	data.submit();
	            }
            },
            submit: function (e, data) {
            	debugger;
            	var file=null;
            	var fileSize = 0;
       	    	file = data.files[0];
       	    	file.datatime = new Date().getTime();
            	var isIE = /msie/i.test(navigator.userAgent) && !window.opera;      
           	    if (!isIE) { 
           	    	fileSize = data.files[0].size;
           	    }
            	temp.ajaxFileUpload(fileSize, file, file.datatime);
            	var hlr = data;
            	temp.addToUploadList(file.datatime, hlr); 
            },
            done: function (e,data) {
            	var datatime = data.files[0].datatime;
            	data = data.result;
//            	data = JSON.parse(data.result);
            	temp.removeFromUploadingList(datatime);
//            	console.log(data.di);
            	
            	
            	temp.currSelector.find("#"+datatime).remove();
            	var file = temp.currSelector.find("#filelist");
                if (data.status = 'success') {
                	data.realfilename;
                    data.attachment_id;
                    data.serverpath;
                    data.servername;
                    data.size;
                    file.append(temp.addHTMLFile(FTPURL, CSSURL, data.serverpath, data.realfilename, temp.bytesToSize(parseInt(data.size)), data.suffix, data.attachment_id, data.size));
                    temp.bindMethod();
                    temp.fileCount = temp.fileCount + 1;
                    temp.fileCountSize = temp.fileCountSize + (parseInt(data.size));
                    temp.reloadFileCount();
                } else {
//                    temp.currSelector.find("#fileToUpload").remove();
                    comm.utils.alert("提示", "上传失败，请重新上传", null, null);
                }
                temp.currSelector.find("#fileToUpload"+didx).remove();
            },
//          fileuploadfail:function (e, data) {
//        	  temp.currSelector.find("#"+didx).remove(); 
//        	  if (data.errorThrown=='abort') {
//                  console.log('上传取消！', 'success',3);
//              }else{
//            	  console.log('上传失败，请稍后重试！', 'error',3);
//              }
//        	  temp.currSelector.find("#fileToUpload"+didx).remove();
//          },
	      error:function(e,data){
	    	
	    	 
	    	  if (data=='abort') {
	    		  console.log('上传取消！');
	    	  }else if (e.status == 413) {
	    		  temp.currSelector.find("#"+didx).remove(); 
//	    		comm.utils.alert("警告","文件过大，上传失败！");
	    	  }else{
				comm.utils.alert("警告","上传失败，请重新上传");
	    	  }
	    	  temp.currSelector.find("#fileToUpload"+didx).remove();
	      },
	      progress: function (e,data) {
          	var time = data.files[0].datatime;
      		var progress = parseInt(data.loaded / data.total * 100, 10);
      		temp.currSelector.find("#proId"+time).css(
      			"width",
      			progress + '%'
      		);
      	}
        });
    },
    
    loadHtmlFiles: function (ftpurl, ipurl, filepath, filename, filesize, suffix, attachment_id, realfilesize) {    //加载附件时调用
        var temp = this;
        var html = [];
        html.push('<div class="fjsc">');
        html.push('<div class="col-xs-3 no-padding">');
        debugger;
        suffix = suffix.toLowerCase();
        if (suffix == "xls" || suffix == "xlsx") {  //excel
            html.push('<img src="' + ipurl + 'static/images/text-icon/excel.png" style="width: 100%;" title="' + filename + '" />');
        } else if (suffix == "txt") {   //txt
            html.push('<img src="' + ipurl + 'static/images/text-icon/txt.png" style="width: 100%;" title="' + filename + '" />');
        } else if (suffix == "pdf") {   //pdf
            html.push('<img src="' + ipurl + 'static/images/text-icon/pdf.png" style="width: 100%;" title="' + filename + '" />');
        } else if (suffix == "ppt" || suffix == "pptx" || suffix == "pps") {   //ppt
            html.push('<img src="' + ipurl + 'static/images/text-icon/ppt.png" style="width: 100%;" title="' + filename + '" />');
        } else if (suffix == "rar" || suffix == "7z" || suffix == "zip") {   //rar zip
            html.push('<img src="' + ipurl + 'static/images/text-icon/rar.png" style="width: 100%;" title="' + filename + '" />');
        } else if (suffix == "png" || suffix == "jpg" || suffix == "gif" || suffix == "bmp") {   //bmp  gif  png  jpg
//        	html.push('<img src="'+ftpurl+filepath +'" style="width: 100%; height:100%" title="' + filename + '" />');
        	html.push('<div style="width: 100%; height:64px;background-image:url('+ftpurl+filepath +');background-size:cover;" title="' + filename + '" ></div>');
        } else if (suffix == "doc" || suffix == "docx") {   //word
            html.push('<img src="' + ipurl + 'static/images/text-icon/word.jpg" style="width: 100%;" title="' + filename + '" />');
        } else {   //other 
            html.push('<img src="' + ipurl + 'static/images/text-icon/qita.png" style="width: 100%;" title="' + filename + '" />');
        }
        html.push('</div>');
        html.push('<div class="col-xs-9 no-padding content-1">');
        html.push('<div class="col-xs-12">');
        html.push('<ul style="line-height: 32px;" title="' + filename + '">');
        html.push('<li><div class="ell" title="' + filename + '" ><b>' + filename + '</b></div></li>');
        html.push('<li><ul class="list-unstyled"><li><i class="ace-icon fa fa-caret-right blue"></i> ' + filesize + '</li></ul></li>');
        html.push('</ul>');
        html.push('</div>');
        html.push('<div class="txt">');
        html.push('<div style="margin: 20px 0 0 50%;font-size: 18px;width: 100%;">');
        debugger;
        if(suffix == "txt" || suffix == "pdf" || suffix == "png" || suffix == "jpg" || suffix == "gif" || suffix == "bmp"){//图片、txt、pdf直接在新窗口中打开预览
        	html.push('<a target="_blank" href="'+window.location.protocol+"//"+window.location.host+ftpurl+filepath+'"><i class="ace-icon fa fa-download white"></i></a>');
        }else{
        	html.push('<a target="_blank" href="/meet/uploadFile/download.do?realFileName=' + encodeURIComponent(filename) + '&downloadUrl='+ filepath +'"><i class="ace-icon fa fa-download white"></i></a>');
        }
        
        if (temp.type == "reload") {
            html.push('<a title="点击删除" style="margin-left: 20%;"><i class="ace-icon glyphicon glyphicon-remove orange delFiles"></i></a>');
        }
        html.push('</div>');
        html.push('</div>');
        html.push('<input type="hidden" name="attachment_id" value="' + attachment_id + '" />');   //文件ID
        html.push('<input type="hidden" name="filename" value="' + filename + '" />');   //文件名称
        html.push('<input type="hidden" name="filesize" value="' + realfilesize + '" />');   //文件大小
        html.push('</div>');
        html.push('</div>');
        return html.join('');
    },
    getUploadingList:function(){
    	var temp = this;
    	var upList = temp.currSelector.find("#filelist").data("uploading");
    	return upList;
    },    
    addToUploadList:function(tid, hlr){
    	var temp = this;
    	var upList = temp.currSelector.find("#filelist").data("uploading");
    	upList.push({handler:hlr, tid:tid});
    	$("#filelist").data("uploading", upList);
    },
    removeFromUploadingList:function(tid){
    	debugger;
    	var temp = this;
    	var upList = temp.currSelector.find("#filelist").data("uploading");
    	
    	for(var i = 0; i < upList.length; ++i){
    		if(upList[i].tid == tid){
    			upList.splice(i, 1);
    			temp.currSelector.find("#filelist").data("uploading", upList);
    			break;
    		}
    	}
    	
    },
    
    ajaxFileUpload: function (fileSize, file, did) {
        var temp = this;
        var url = "/meet/uploadFile/upload.do";
        if(fileSize > 50 * 1024 * 1024){
        	comm.utils.alert("警告", "单个文件不能超过50MB", null, null);
        	return;
        }
        
        var re = temp.currSelector.find("#filelist");
        var fileAllName = file.name;
        var filename=fileAllName.replace(/.*(\/|\\)/, ""); 
        var fileExt=(/[.]/.exec(fileAllName)) ? /[^.]+$/.exec(fileAllName.toLowerCase()) : ''; 
        var size = Math.round((file.size/1024) * 100)/100 + "KB";
        re.append(temp.addUploadHTML(filename,fileExt,size,CSSURL, undefined, undefined, did));
    },
    
    addUploadHTML:function(filename,suffix,filesize,ipurl,filepath,loading, did) {
    	debugger;
    	var html = [];
    	var ftpurl = FTPURL;
    	html.push('<div class="fjsc addNewFileTemp" id='+did+' >');
        html.push('<div class="col-xs-3 no-padding">');
        if (suffix == "xls" || suffix == "xlsx") {  //excel
            html.push('<img src="' + ipurl + 'static/images/text-icon/excel.png" style="width: 100%;" title="' + filename + '" />');
        } else if (suffix == "txt") {   //txt
            html.push('<img src="' + ipurl + 'static/images/text-icon/txt.png" style="width: 100%;" title="' + filename + '" />');
        } else if (suffix == "pdf") {   //pdf
            html.push('<img src="' + ipurl + 'static/images/text-icon/pdf.png" style="width: 100%;" title="' + filename + '" />');
        } else if (suffix == "ppt" || suffix == "pptx" || suffix == "pps") {   //ppt
            html.push('<img src="' + ipurl + 'static/images/text-icon/ppt.png" style="width: 100%;" title="' + filename + '" />');
        } else if (suffix == "rar" || suffix == "7z" || suffix == "zip") {   //rar zip
            html.push('<img src="' + ipurl + 'static/images/text-icon/rar.png" style="width: 100%;" title="' + filename + '" />');
        } else if (suffix == "png" || suffix == "jpg" || suffix == "gif" || suffix == "bmp") {   //bmp  gif  png  jpg
            html.push('<img src="' + ipurl + 'static/images/text-icon/tu.png" style="width: 100%;" title="' + filename + '" />');
        } else if (suffix == "doc" || suffix == "docx") {   //word
            html.push('<img src="' + ipurl + 'static/images/text-icon/word.jpg" style="width: 100%;" title="' + filename + '" />');
        } else {   //other 
            html.push('<img src="' + ipurl + 'static/images/text-icon/qita.png" style="width: 100%;" title="' + filename + '" />');
        }
        html.push('</div>');
        html.push('<div class="col-xs-9 no-padding content-1">');
        html.push('<div class="col-xs-12">');
        html.push('<ul style="line-height: 32px;">');
        html.push('<li><div class="ell" ><b>'+ filename +'</b></div></li>');
        html.push('<li><ul class="list-unstyled"><li><i class="ace-icon fa fa-caret-right blue"></i> ' + filesize + '</li></ul></li>');
        html.push('</ul>');
        html.push('</div>');
        html.push('<div class="txt">');
        html.push('<div style="margin: 20px 0 0 50%;font-size: 18px;width: 100%;">');
        debugger;
        if(suffix == "txt" || suffix == "pdf" || suffix == "png" || suffix == "jpg" || suffix == "gif" || suffix == "bmp"){//图片、txt、pdf直接在新窗口中打开预览
        	html.push('<a target="_blank" href="'+window.location.protocol+"//"+window.location.host+ftpurl+filepath+'"><i class="ace-icon fa fa-download white"></i></a>');
        }else{
        	html.push('<a target="_blank" href="/meet/uploadFile/download.do?realFileName=' + encodeURIComponent(filename) + '&downloadUrl='+ filepath +'"><i class="ace-icon fa fa-download white"></i></a>');
        }
        html.push('<a title="点击删除" style="margin-left: 20%;"><i class="ace-icon glyphicon glyphicon-remove orange delFiles"></i></a>');
        html.push('</div>');
        html.push('</div>');
        html.push('<input type="hidden" name="attachment_id" value="" />');   //文件ID
        html.push('<input type="hidden" name="filename" value="" />');   //文件名称
        html.push('<input type="hidden" name="filesize" value="" />');   //文件大小
        html.push('</div>');
	        html.push('<div class="col-xs-12 no-padding" style="margin-top: -64px;height: 64px;">');   //上传进度
	        html.push('<div class="progress progress-mini progress-striped active" style="position: relative;top: 54px;">');
	        html.push('<div id=proId'+did+' class="progress-bar progress-bar-striped" style="width:0% ;"></div>');
	        html.push('</div>');
	        html.push('</div>');
        html.push('</div>');
        return html.join('');
    },
    
    addHTMLFile: function (ftpurl, ipurl, filepath, filename, filesize, suffix, attachment_id, realfilesize) {    //上传时调用此方法
        var temp = this;
        var html = [];
        var ftpurl = FTPURL;
        debugger;
        html.push('<div class="fjsc addNewFile" >');
        html.push('<div class="col-xs-3 no-padding">');
        suffix = suffix.toLowerCase();
        if (suffix == "xls" || suffix == "xlsx") {  //excel
            html.push('<img src="' + ipurl + 'static/images/text-icon/excel.png" style="width: 100%;" title="' + filename + '" />');
        } else if (suffix == "txt") {   //txt
            html.push('<img src="' + ipurl + 'static/images/text-icon/txt.png" style="width: 100%;" title="' + filename + '" />');
        } else if (suffix == "pdf") {   //pdf
            html.push('<img src="' + ipurl + 'static/images/text-icon/pdf.png" style="width: 100%;" title="' + filename + '" />');
        } else if (suffix == "ppt" || suffix == "pptx" || suffix == "pps") {   //ppt
            html.push('<img src="' + ipurl + 'static/images/text-icon/ppt.png" style="width: 100%;" title="' + filename + '" />');
        } else if (suffix == "rar" || suffix == "7z" || suffix == "zip") {   //rar zip
            html.push('<img src="' + ipurl + 'static/images/text-icon/rar.png" style="width: 100%;" title="' + filename + '" />');
        } else if (suffix == "png" || suffix == "jpg" || suffix == "gif" || suffix == "bmp" || suffix == "JPG") {   //bmp  gif  png  jpg
//        	html.push('<img src="'+ftpurl+filepath +'" style="width: 100%; height:100%" title="' + filename + '" />');
        	html.push('<div style="width: 100%; height:64px;background-image:url('+ftpurl+filepath +');background-size:cover;" title="' + filename + '" ></div>');
        } else if (suffix == "doc" || suffix == "docx") {   //word
            html.push('<img src="' + ipurl + 'static/images/text-icon/word.jpg" style="width: 100%;" title="' + filename + '" />');
        } else {   //other 
            html.push('<img src="' + ipurl + 'static/images/text-icon/qita.png" style="width: 100%;" title="' + filename + '" />');
        }
        
        html.push('</div>');
        html.push('<div class="col-xs-9 no-padding content-1">');
        html.push('<div class="col-xs-12">');
        html.push('<ul style="line-height: 32px;" title="' + filename + '">');
        html.push('<li><div class="ell" title="' + filename + '" ><b>' + filename + '</b></div></li>');
        html.push('<li><ul class="list-unstyled"><li><i class="ace-icon fa fa-caret-right blue"></i> ' + filesize + '</li></ul></li>');
        html.push('</ul>');
        html.push('</div>');
        html.push('<div class="txt">');
        html.push('<div style="margin: 20px 0 0 50%;font-size: 18px;width: 100%;">');
        debugger;
        if(suffix == "txt" || suffix == "pdf" || suffix == "png" || suffix == "jpg" || suffix == "gif" || suffix == "bmp"){//图片、txt、pdf直接在新窗口中打开预览
        	html.push('<a target="_blank" href="'+window.location.protocol+"//"+window.location.host+ftpurl+filepath+'"><i class="ace-icon fa fa-download white"></i></a>');
        }else{
        	html.push('<a target="_blank" href="/meet/uploadFile/download.do?realFileName=' + encodeURIComponent(filename) + '&downloadUrl='+ filepath +'"><i class="ace-icon fa fa-download white"></i></a>');
        }
        
        html.push('<a title="点击删除" style="margin-left: 20%;"><i class="ace-icon glyphicon glyphicon-remove orange delFiles"></i></a>');
        html.push('</div>');
        html.push('</div>');
        html.push('<input type="hidden" name="attachment_id" value="' + attachment_id + '" />');   //文件ID
        html.push('<input type="hidden" name="filename" value="' + filename + '" />');   //文件名称
        html.push('<input type="hidden" name="filesize" value="' + realfilesize + '" />');   //文件大小
        
        return html.join('');
    },
    submitFiles: function (htmlId) {   //获取页面的files的attachment_id
        var temp = this;
        temp.currSelector = htmlId.find("#uploadFiles");
        //清空存储附件ID的列表
        temp.uploadFilesList = [];

        var fileList = temp.currSelector.find("#filelist").find(".addNewFile");
        if (fileList.length > 0) {
            $.each(fileList, function (index, obj) {
                var objId = new Object();
                objId.attachment_id = $(obj).find("input[name='attachment_id']").val();
                temp.uploadFilesList.push(objId);
            });
        }
        return temp.uploadFilesList;
    },
    bytesToSize: function (bytes) {  //字节转换为大小
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		if (bytes == 0) return '0 B';;
		var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		if (i == 0) return bytes + ' ' + sizes[i]; 
		return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    }
};