/* 通讯录管理
 * zedd
 * 2016.1.14
 */
//全局参数
var config = {
		initDeptUrl:"contact/initDepartment.action",
		addDeptUrl:"contact/addDept.action",
		updateDeptUrl:"contact/updateDept.action",
		delDeptUrl:"contact/delDept.action"
};
//tree 设置
var $body= $("body");
var zNodes,zTree;
var rMenu = $("#rMenu");
var setting = {
		data: {
			key: {
				children: "child"
			}
		},
		edit: {
			enable: true,
			showRemoveBtn: false,
			showRenameBtn: false
		},
		view: {
			dblClickExpand: false,
			showLine: false
		},
		callback: {
			onRightClick: OnRightClick,
			beforeRename: beforeRename
		}
};	
function  getTree(){
	var initUrl = config.initDeptUrl;
	ajaxServer(initUrl,{},function(data){
		zNodes = data.data;
		printTree(zNodes);
	},{type:"GET"});	
}	
function printTree(zNodes){
	$.fn.zTree.init($("#tree"), setting, zNodes);
	zTree = $.fn.zTree.getZTreeObj("tree");
}
function OnRightClick(event, treeId, treeNode) {
	var mX = event.clientX-30,
		mY = event.clientY+10;
	if (!treeNode && event.target.tagName.toLowerCase() != "button" && $(event.target).parents("a").length == 0) {
		zTree.cancelSelectedNode();
		showRMenu("root", mX, mY);
	} else if (treeNode && !treeNode.noR) {
		zTree.selectNode(treeNode);
		showRMenu("node", mX, mY);
	}
}
function showRMenu(type, x, y) {
	$("#rMenu ul").show();
	if (type=="root") {
		$("#m_del").hide();
	} else {
		$("#m_del").show();
	}
	rMenu.css({"top":y+"px", "left":x+"px", "visibility":"visible"});

	$("body").bind("mousedown", onBodyMouseDown);
}
function hideRMenu() {
	if (rMenu) rMenu.css({"visibility": "hidden"});
	$("body").unbind("mousedown", onBodyMouseDown);
}
function onBodyMouseDown(event){
	if (!(event.target.id == "rMenu" || $(event.target).parents("#rMenu").length>0)) {
		rMenu.css({"visibility" : "hidden"});
	}
}
var newCount = 1;
var addStatus = false;
function addTreeNode(e) {
	hideRMenu();
	var zTree = $.fn.zTree.getZTreeObj("tree"),
		nodes = zTree.getSelectedNodes(),
		treeNode = nodes[0];
	var isParent = false;
	if (treeNode) {
		treeNode = zTree.addNodes(treeNode, {id:(100 + newCount), parentId:treeNode.id, isParent:isParent, name:"新增部门"});
	} else {
		treeNode = zTree.addNodes(null, {id:(100 + newCount), parentId:0, isParent:isParent, name:"新增部门"});
	}
	if (treeNode) {
		addStatus = true;
		zTree.editName(treeNode[0]);
	} else {
		alert("此部门无法增加子部门");
	}
};
function removeTreeNode(e) {
	hideRMenu();
	var zTree = $.fn.zTree.getZTreeObj("tree"),
		nodes = zTree.getSelectedNodes(),
		treeNode = nodes[0];
	var delUrl = config.delDeptUrl;
	if (nodes && nodes.length>0) {
		if (nodes[0].child && nodes[0].child.length > 0) {//父部门的情况
			msg = "此部门有下级部门，确认删除此部门?";			
		} else{//子部门的情况
			msg = "确认删除此部门?";
		}
		$body.modalBox({
			msg:msg,
			okFun:function(){
				ajaxServer(delUrl,JSON.stringify({"id":nodes[0].id}),function(data){
					if (data.success) {
						$.modalBox.close();
						zTree.removeNode(treeNode, callbackFlag);
						$body.msgBox({
							 status : 'success',
					         msg : "删除成功",
					         time:1000
						});
					}
				});
			}
		});
	}
};
function beforeRename(treeId, treeNode, newName) {
	var addDeptUrl = config.addDeptUrl;
	var updateDeptUrl = config.updateDeptUrl;
	var param = JSON.stringify({
			"id":treeNode.id,
			"name":newName,
			"parentId":treeNode.parentId,
			"order":treeNode.order
		});
	//console.log(treeId+"," +treeNode.parentId+"," +newName);
	if(addStatus == true){
		ajaxServer(addDeptUrl,param,function(data){
			if (data.success) {
				$body.msgBox({
					 status : 'success',
			         msg : "新增成功",
			         time:1000
				});
				addStatus = false;
			}
		});
	}else{
		ajaxServer(updateDeptUrl,param,function(data){
			if (data.success) {
				$body.msgBox({
					 status : 'success',
			         msg : "重命名成功",
			         time:1000
				});
			}
		});
	}
}
function renameTreeNode() {
	hideRMenu();
	var zTree = $.fn.zTree.getZTreeObj("tree"),
	nodes = zTree.getSelectedNodes(),
	treeNode = nodes[0];
	if (nodes.length == 0) {
		alert("请先选择一个部门");
		return;
	}
	zTree.editName(treeNode);
};
$(document).ready(function(){	
	//构建部门树
	getTree();
	//新增部门
	$("#m_add").on("click",function(){
		addTreeNode();
	});
	//重命名部门
	$("#m_rename").on("click",function(){
		renameTreeNode();
	});
	//删除部门
	$("#m_del").on("click",function(){
		removeTreeNode();
	});
});