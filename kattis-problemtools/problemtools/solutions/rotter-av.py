N = int(input())
a = input()
s = input()

L = len(a)

def rot(x,N):
  if not x in a:
    return x

  d = N
  
  pos = a.index(x)
  newpos = (pos+d)%L

  return a[newpos]
    

sdec = ""
for c in s:
  sdec += rot(c,N)

print(sdec)

