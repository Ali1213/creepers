#-*- coding:utf-8 -*-
import urllib2
from bs4 import BeautifulSoup

 
# 要爬取的总url
weburl='http://translate.google.cn/'

class Climbing():    
    # 设置代理开关
    enable_proxy = False
    
    # 总url
    url = ''
    
    # 初始化
    def __init__(self, url):
        self.url = url
        proxy_handler = urllib2.ProxyHandler({"http" : 'web-proxy.oa.com:8080'})
        null_proxy_handler = urllib2.ProxyHandler({})
        if self.enable_proxy:
            opener = urllib2.build_opener(proxy_handler)
        else:
            opener = urllib2.build_opener(null_proxy_handler)
        urllib2.install_opener(opener)
    
    # 根据url，得到请求返回内容的soup对象
    def __getResponseSoup(self, url):
        request = urllib2.Request(url)
        request.add_header('User-Agent', "Mozilla/5.0")
        #request.add_header('Accept-Language', 'zh-ch,zh;q=0.5')
        response = urllib2.urlopen(request)
        resault = response.read()
        soup = BeautifulSoup(resault, "html.parser")
        return soup
    
    # 爬取TKK
    def getTKK(self):    
		soup = self.__getResponseSoup(self.url)
		allinfo = soup.find_all('script')
		for info in allinfo:
			chinese = info.get_text().encode('utf-8')
			#print chinese
			if chinese.find("TKK") > 0:    
				#print chinese
				res = chinese.split("TKK")[1]
				res = res.split(");")[0]
				print "TKK"+res+");"
				print "console.log(TKK);"

        
c = Climbing(weburl)
c.getTKK()