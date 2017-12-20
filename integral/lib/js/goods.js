(function(){
	//获取路径上的参数，用来决定是否展示操作按钮
	~function () {
	    var strPro = String.prototype;
	    strPro.myQueryURLParameter = function () {
	        var reg = /([^?&=]+)=([^?&=]+)/g, obj = {};
	        this.replace(reg, function () {
	            obj[arguments[1]] = arguments[2];
	        });
	        return obj;
	    }
	}();
	var searchObj=location.href.myQueryURLParameter();
	window.searchUrlObj={};
    for(var k in searchObj){
        //因为后台暂时没有对路径上的参数进行加密，所以先不解密，直接用
        searchUrlObj[k] = searchObj[k];
	}
  
    
	
	var $myModal = $("#myModal");  //这是新增书籍与修改书籍用的dom
	var $myModalBor = $("#myModalBor");  //这是我要借书板块用的dom
	var $myModalExport = $("#myModalexport"); //这是我要导出用的dom
	var $gTable = $("#gTable");
	var $myModalLabel = $("#myModalLabel");
	var cacheDate = {};
    var parms = {
    	query:'',
    	size:12,
    	page:0,
    	classV:'',
    	statusV:''
    };
    var totalPage;
	var isBorrow = false;
    
    //分页
    $("#pagination").on("click","li",function(){
 		var $this = $(this),
 		    page = $this.attr("data-page");
 		
 		if($this.attr("id") == "prev"){
 			page = parseInt($("#pagination").find(".active").attr("data-page"))-1;
 		    
 		}else if($this.attr("id") == "next"){
 			page = parseInt($("#pagination").find(".active").attr("data-page"))+1;
 		}
 		if(page<0){
 			page = 0;
 		}else if(page>=totalPage){
 			page = totalPage-1;
 		}
 		parms.page = page;
 		getGoodsList();
    });
    //上一页

	//搜索商品
	$("#searchBtn").on("click",function(){
		var $searchIpt = $("#searchVal"),
		    searchV = $searchIpt.val();
		parms.page = 0;
		parms.query = searchV;
		getGoodsList();
	});

	//点击新增商品
	$("#newBtn").on("click",function(){
		$myModal.find("form").trigger('reset').find("#gid").val("");
		$myModalLabel.html("新增书籍");
		$myModal.modal('show');
		
	});
	//点击删除商品
	$("#delBtn").on("click",function(){
		var $checkeds = $gTable.find("tbody input[type=checkbox]:checked");
		var len = $checkeds.length;
		var ids = [];
		if(len == 0){
			layer.msg("没有选中任何书籍，请重新选择",{
				offset:'t',
				anim:6
			});
			return;
		}
		layer.confirm('确定删除此书么？', {
		  btn: ['确定','取消'] //按钮
		}, function(index){
			layer.close(index);
		    $checkeds.each(function(){
				ids.push(this.id);
			});
			$.post('goods_del',{ids:ids.join(",")},function(response){
				if(response.status == 'success'){
					getGoodsList();
				}else{
					layer.msg("删除失败，请重试",{
						offset:'t',
						anim:6
					});
				}
			},"json");
		});

		
	})
    
    //修改商品
    $("#updateBtn").on("click",function(){
    	var $checkeds = $gTable.find("tbody input[type=checkbox]:checked");
		var len = $checkeds.length;
		var id,obj;
		
		if(len != 1){
			layer.msg("只能一次修改一本书，请重新选择",{
				offset:'t',
				anim:6
			});
			return;
		}
		id = $checkeds[0].id;
		obj = cacheDate[id];
		
		
		
		$("#gid").val(obj.id);
		$("#name").val(obj.name);
		$("#price").val(obj.price);
		$("#number").val(obj.detail);
		$("#classify").val(obj.classify);


		$myModalLabel.html("修改商品");
		$myModal.modal('show');
		
    });
   
    //获取当前时间
    function CurentTime()
    { 
        var now = new Date();
       
        var year = now.getFullYear();       //年
        var month = now.getMonth() + 1;     //月
        var day = now.getDate();            //日
       
        var hh = now.getHours();            //时
        var mm = now.getMinutes();          //分
       
        var clock = year + "-";
       
        if(month < 10)
            clock += "0";
       
        clock += month + "-";
       
        if(day < 10)
            clock += "0";
           
        clock += day + "-";
       
        if(hh < 10)
            clock += "0";
           
        clock += hh + ":";
        if (mm < 10) clock += '0'; 
        clock += mm; 
        return(clock); 
    } 
   

    //点击保存按钮
	$(".saveMess").on("click",function(){
		var data = {
			id:$("#gid").val(),
			userid:$("#userNumber").val(),
			username:$("#userName").val(),
			userintegral:$("#userIntegral").val()
		};
		if($.trim(data.userid) == ""){
			layer.msg("用户名不能为空",{
				offset:'t',
				anim:6
			});
			return;
		}else if($.trim(data.username) == ""){
			layer.msg("用户名不能为空",{
				offset:'t',
				anim:6
			});
			return;
		}else if($.trim(data.userintegral) == ""){
			layer.msg("积分不能为空",{
				offset:'t',
				anim:6
			});
			return;
		}
		// 出现遮罩
		layer.load();
		if(data.id){   //修改
			url = "user_update";
		}else{
			url = "user_add";
		}
f			if(response.status == 'success'){
				$myModal.modal('hide');
				$myModal.find("form").trigger('reset');
			    getGoodsList();
			}else{
				layer.msg("保存失败，请重试~",{
					offset:'t',
					anim:6
				});
			}
			layer.closeAll('loading');
		},'json')
		
	});

	
	
	//加载商品列表
	var getGoodsList = function(){
		
		layer.load();
	
		$.post("userintegral_list",parms,function(response){
			if(response.status == "success"){
				layer.closeAll('loading');
				renderTable(response.data);
				renderPaging(response.total);
				
			}else{
				layer.closeAll('loading');
			}
		},'json')
	};
	var renderTable = function(data){
		var trs = [];
		$.each(data,function(index,obj){
			trs.push('<tr>',
				'<td><input id="'+obj.id+'" type="checkbox" /></td>',
                '<td>'+obj.id+'</td>',
                '<td>'+obj.username+'</td>',
                '<td>'+obj.userintegral+' 分</td>',
                '</tr>');
			cacheDate[obj.id] = obj;
			
		});
		$gTable.find("tbody").html(trs.join(""));
	};
	var renderPaging = function(total){
		totalPage = Math.ceil(total/parms.size);
		var pArr = ['<li id="prev"><a href="#" >&laquo;</a></li>'];

		for(var i = 0;i<totalPage;i++){
			if(parms.page == i){
				pArr.push('<li data-page="',i,'" class="active"><a href="javascript:;">'+(i+1)+'</a></li>');
			}else{
				pArr.push('<li data-page="',i,'"><a href="javascript:;">'+(i+1)+'</a></li>');
			}
			
		}
		pArr.push('<li id="next"><a href="#" >&raquo;</a></li>');
		$("#pagination").html(pArr.join(""));
		$(".allNumber").html("总共:"+total+"本");
	}
	getGoodsList();

})();