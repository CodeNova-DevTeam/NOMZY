FOLDERS=(
  "feature-admin"
  "feature-idSearch"
  "feature-pwSearch"
  "feature-reviewPage"
  "feature-signup"
  "feature-cerationReview"
  "jsUtil"
)

for folder in "${FOLDERS[@]}"
do
  echo "⏳ [$folder] 브랜치 생성 중..."

  git checkout --orphan temp-$folder
  git rm -r --cached -f .
  git add $folder/
  git commit -m "init: $folder 업로드"
  git branch -D $folder 2>/dev/null
  git branch -m $folder
  git push origin --force $folder

  echo "✅ [$folder] 완료!"
done

echo "🎉 전체 완료!"