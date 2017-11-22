N = int(input())
a = input()
s = input()

L = len(a)

def derot(x,N):
  if not x in a:
    return x

  d = (-N)%L
  
  pos = a.index(x)
  newpos = (pos + d)%L
  return a[newpos]
    
sdec = ""
for c in s:
  sdec += derot(c,N)

print(sdec)

