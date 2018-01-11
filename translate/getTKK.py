#-*- coding:utf-8 -*-
import os

# ��ȡ��ҳ�õ�TKK��js����
os.system('getTKKjs.py > getTKK.js')  

# ִ��TKKjs�����õ�TKKֵ
os.system('node getTKK.js > TKK')