#-*- coding:utf-8 -*-
import time
import urllib2
import urllib
from sys import argv
 
script,zh,tk = argv

url='http://translate.google.cn/translate_a/single?client=t&sl=zh-CN&tl=en&hl=zh-CN&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&ie=UTF-8&oe=UTF-8&pc=1&otf=1&ssel=6&tsel=3&kc=0&tk='+ tk +'&q=' + zh

def getRes():
	#print 'chinese is :'+urllib.unquote(first)
	
	null_proxy_handler = urllib2.ProxyHandler({})
	opener = urllib2.build_opener(null_proxy_handler)
	urllib2.install_opener(opener)

	req = urllib2.Request(url) 
	req.add_header('User-Agent', "Mozilla/5.0")

	response = urllib2.urlopen(req)
	print response.read()

print getRes()