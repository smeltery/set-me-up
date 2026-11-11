var r={name:"debian",category:"distros",note:"the red swirl, scanned now and then",cols:46,rows:28,fps:30,options:{scan:5},palette:["#a80030","#c65978","#e5b3c1","#c20037","#d7597d","#edb3c3"]},T=String.raw`

                 _pppqq____q__
             _pp888888888888888qpqp,
          _p888888888PPPPYP8888888888q,
        _p8888888P"            "Y888888q,
       p888888"                   "888888p
   _  q888P"                        Y88888p
    _p88P"                           )888"O
  ,_888"             ._pp0OOo(,       O888 :
  'd88P             q8"'      ''      "888,
  q88P            .pP                  888,
  |88P            qP             ,     888"
  q88|            8|                  '88P
  |88'            8b           _.     q88'
  d88.            )8p      __        q88'
  |88p           ~,"8q,            _p8Y
  '88b            ""("8q__    __pq8P"
   d88,              "YdPP88888P""'
   '8888p                '"^^'
    "888q
     "888p
      '888p
        "88q,
         'Y88q_
           'Y88q,
              "Y8qq_
                 '"YOo___,

`,N=String.raw`

                 __ppqq____q__
             _pp888888888888888qpqp,
          _p888888888PPPPYP8888888888q,
        _p8888888P"            "Y888888q,
       p888888"                   "888888p
   _  q8888"                        Y88888p
    _p888"                           )888"O
  ,_888"             ._pp0OOo(,       O888 :
  'd88P             q8"'      ''      "888,
  q888            .pP                  888,
  |88P            qP             ,     888"
  |88|            8|                  '88P
  |88'            8b           _.     q88'
  |88,            )8p      __        q88'
  |88p           ~,"8q,            _p8Y
  '88b            ""("8q__    __pq88"
   d88,              "YdPP88888PY"'
   '8888p                '"^^'
    "888q'
     "888p
      '888p
        "88q,
         'Y88q_
           'Y88q,
              "Y8qq_
                 '"YOo___,

`,R=String.raw`

                 0000000000000
             00000000000000000000000
          00000000000000000000000000000
        00000000000            0000000000
       00000000                   00000000
   0  000000                        0000000
    000000                           000000
  000000             0000000000       0000 0
  00000             0000      00      00000
  0000            000                  0000
  0000            00             0     0000
  0000            00                  0000
  0000            00           00     0000
  0000            000      00        0000
  0000           000000            0000
  0000            00000000    0000000
   0000              00000000000000
   000000                00000
    000000
     00000
      00000
        00000
         000000
           000000
              000000
                 000000000

`,v=.5,S=2,c=2,x=5,y="#$%&*+<=>?@[]{}",d=p=>p.slice(1,-1).split(`
`).map(s=>s.padEnd(r.cols));function F(p,s,_){let t=Math.imul(p,73856093)^Math.imul(s,19349663)^Math.imul(_,83492791);return t=Math.imul(t^t>>>13,1274126177),(t^t>>>16)>>>0}function j({scan:p=r.options.scan}={}){let{cols:s,rows:_,fps:t}=r,m=d(T),h=d(N),A=d(R),Y=r.palette.length/6,u=p>0?Math.max(p,S+.5):0,i=_,P=-1;for(let a of[m,h])a.forEach((l,o)=>{l.trim()&&(i=Math.min(i,o),P=Math.max(P,o))});let I=P-i+1+c+x;return(a,{paper:l=!1,color:o}={})=>{let k=o?h:m,O=a-v,D=u&&O>=0?i+I*(O%u)/S:-1/0,E=Math.floor(a*t/2),b=[];for(let n=0;n<_;n++){let q=D-n,M=q>=0&&q<c?2:q>=c&&q<c+x?1:0,g="";for(let e=0;e<s;e++){let f=k[n][e];if(f!==" "){if(M===2){let w=F(e,n,E);w%4&&(f=y[(w>>>2)%y.length])}o&&(o[n*s+e]=(l?0:3*Y)+M*Y+parseInt(A[n][e],36))}g+=f}b.push(g)}return b.join(`
`)}}export{j as default,r as meta};
