
var sweetUIHandler = {
	
	success : function(msg, title, callback){
		var _title = null;
		var _callback = $.noop();
		
		var isfn1 = (typeof title === 'function');
		var title_default = "提示信息";
		if(isfn1){
			_title = title_default;
			_callback = title;
		}else{
			_title = title;
			_callback = callback;
		}
		swal({title:_title,text:msg,type:"success"},function(){
			if(typeof _callback === 'function'){
				_callback();
			}
        });
	
			
	},
	error : function(msg, title, callback){
		var _title = null;
		var _callback = $.noop();
		
		var isfn1 = (typeof title === 'function');
		var title_default = "提示信息";
		if(isfn1){
			_title = title_default;
			_callback = title;
		}else{
			_title = title;
			_callback = callback;
		}
		swal({title:_title,text:msg,type:"error"},function(){
			if(typeof _callback === 'function'){
				_callback();
			}
        });
		
	},
	warning : function(msg, title, callback){
		var _title = null;
		var _callback = $.noop();
		
		var isfn1 = (typeof title === 'function');
		var title_default = "提示信息";
		if(isfn1){
			_title = title_default;
			_callback = title;
		}else{
			_title = title;
			_callback = callback;
		}
		swal({title:_title,text:msg,type:"warning"},function(){
			if(typeof _callback === 'function'){
				_callback();
			}
        });
	
	},
	
	// 当选择确定按钮时isConfirmCallback为true,cancelCallback为null，调用confirmBase方法
	confirm :function(msg, title, callback){
		sweetUIHandler.confirmBase(msg, title, callback, null,true);
	},
	
	// 当选择取消按钮时isConfirmCallback为false,confirmCallback为null，调用confirmBase方法
	cancelConfirm :function(msg, title, callback){
		sweetUIHandler.confirmBase(msg, title, null, callback,false);
	},
	confirmBase : function(msg, title, confirmCallback, cancelCallback,isConfirmCallback){
		var _title = null;
		var _confirmCallback = $.noop();
		var _cancelCallback = $.noop();
		
		var isfn1 = (typeof title === 'function');
		var title_default = "提示信息";
		// 判断title是否为一个function函数
		if(isfn1){
			_title = title_default;
			// 如果confirmCallback不为null情况下
			if(confirmCallback){
				_confirmCallback = title;
				_cancelCallback = confirmCallback;
			}else{	
				if(isConfirmCallback){
					// 当isConfirmCallback为true，title赋值给_confirmCallback
					_confirmCallback = title;
				}else{
					// 否则title赋值给_cancelCallback
					_cancelCallback = title;
				}
			}
		}else{
			_title = title;
			// 如果confirmCallback，confirmCallback都不为null
			if(confirmCallback&&confirmCallback){
				_confirmCallback = confirmCallback;
				_cancelCallback = cancelCallback;
			}else{
				if(isConfirmCallback){
					// 当isConfirmCallback为true，title赋值给_confirmCallback
					_confirmCallback = confirmCallback;
				}else{
					// 否则title赋值给_cancelCallback
					_cancelCallback = cancelCallback;
				}
			}
			
		}
        swal({title:_title,text:msg,
        		type:"warning",showCancelButton:true,confirmButtonColor:"#DD6B55",
        		confirmButtonText:"确定",cancelButtonText:"取消",
        		closeOnConfirm:false,closeOnCancel:false,},
        		function(isConfirm){
					if(isConfirm){
						//swal("",null,"");
							if(typeof _confirmCallback === 'function')
								_confirmCallback();
							
        			}else{
						//swal("",null,"");	
						if(typeof _cancelCallback === 'function')
								_cancelCallback();
					}
					window.location.reload();
			});
			
	},
	/**
	 * 重新加载tab也签，没有则新增，有则重新加载
	 * tab的overrideTabItem不同于tab的reload方法
	 * @param url
	 * @param txt
	 * @param id
	 * @param icon
	 */
	tabItemAdd : function(url,txt,id,icon){
		
		var _tab = top.tab;	//获取菜单页签对象
		
		if(_tab.isTabItemExist(id)){
//			_tab.selectTabItem(id);
			_tab.removeTabItem(id);
			_tab.addTabItem({ tabid:id,text:txt,url:url,icon:icon});
    	}
    	else{
    		_tab.addTabItem({ tabid:id,text:txt,url:url,icon:icon});
    	}
/*		
		if(_tab.isTabItemExist(id)){
    		tab.selectTabItem(id);
    		tab.reload(id);
    	}
    	else{
    		tab.addTabItem({ tabid:id,text:txt,url:url,icon:icon});
    	}
*/
	}
		
		
};