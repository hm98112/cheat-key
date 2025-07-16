# Git

버젼 관리 시작

```bash
cd myproject(내프로젝트)
git init
```

최초 버젼 생성

```bash
git add . # 스테이지 업로드 (현재 경로에 있는 걸 전부)
git commit -m "commitmessage" # 커밋(버젼) 생성
```

원격 저장소 추가

```bash
#git remote add 원격저장소별칭(origin) 원격저장소주소
git remote  add origin https://github.com/소유자/저장소이름.git
```

원격 저장소 업로드(Push)

```bash
#git push 별칭(origin) 브랜치이름
git push origin main
```

원격 저장소 복제(Clone)

```bash
# git clone 원격저장소주소
git clone https://github.com/소유자/저장소이름.git

```

원격저장소 다운로드(Pull)

```bash
# git pull 별칭 브렌치이름
git pull origin main
```

---
