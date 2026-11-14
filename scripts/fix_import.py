with open(r'E:\Scripe_pro\SCRIPE-Frontend-academy-s0-s8\src\modules\academy\athletes\src\presentation\views\AcademyAthletesView.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = 'import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";'
replacement = 'import { AthleteCard } from "../components/AthleteCard";'

if target in text:
    text = text.replace(target, replacement)
    print("Replaced target with AthleteCard import!")
else:
    print("Target not found!")

with open(r'E:\Scripe_pro\SCRIPE-Frontend-academy-s0-s8\src\modules\academy\athletes\src\presentation\views\AcademyAthletesView.tsx', 'w', encoding='utf-8', newline='') as f:
    f.write(text)
