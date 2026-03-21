# Student Performance Analyzer

## Description:
A console-based JavaScript program that analyzes student performance using an array of objects. The program should calculate different statistics such as totals, averages, 
subject-wise analysis, and determine the class topper. This program also provide the summary of all student performance.

## Feature: 
* Total marks for each student.
* Average marks for each student.
* Subject wise highest marks. 
* Subject wise average marks.
* Finding class topper.
* Assigning Grades.

## Output
### 1.  Total marks for each student.
#### Approach:
* An array of student objects is defined, each containing subject-wise information.
* The function calTotalMarks will be used to calculate marks for each student, by iterating over the marks dataset
and accumulates the score.

<img width="604" height="376" alt="image" src="https://github.com/user-attachments/assets/b0265f52-0949-4f35-8976-4d9bf2d133f5" />

### 2. Average marks for each student.
* The avgMarks funciton is used to calcuate the average marks.
* Here, firstly iterate over the dataset and calculate total marks using already defined calTotalMarks.
* Average is computed by dividing the total marks by the subjectcount.
<img width="858" height="515" alt="program2" src="https://github.com/user-attachments/assets/00cd8641-eed9-4b5d-85c3-bcd211ff211d" />

### 3. Subject wise highest score.
* The function subjectHighScore, uses the first student as a reference baseline, then compares the same subject across all other students.
* For each subject, iterates through all students and updates highest score and student name.
* Prints the highest scorer for each subject after completing comparisons.
<img width="1049" height="626" alt="program3" src="https://github.com/user-attachments/assets/2c009e2e-4010-4ccb-84dd-5dea6ba1fe0e" />

### 4. Subject wise average marks.
* The function averageSubjectMarks uses an object (subjectInfo) to store total marks and count of students per subject.
* Iterates through all students and their marks to accumulate totals and counts.
* Calculates average as total / count for each subject and prints the result.
<img width="1123" height="638" alt="program4" src="https://github.com/user-attachments/assets/6567f1af-7051-4d67-bb9b-dfff25c7c35a" />

### 5. Find Class topper.
* The function classTopper iterates through all students and uses calTotalMarks() to calculate total marks for each student.
* Compares totals to track the highest scorer (topper).
* Updates topper name and marks whenever a higher total is found.
  <img width="855" height="341" alt="program5" src="https://github.com/user-attachments/assets/0eedcea4-6207-4fb9-b693-ba1acbb30bfe" />

### 6. Grading
* The function gradeAssign calculates average marks per student and checks for failure conditions:
** Any subject score ≤ 40
** Attendance < 75
* If no failure conditions, assigns grades based on average of their marks.
* Prints grade or failure reason for each student.
  <img width="1286" height="875" alt="program6" src="https://github.com/user-attachments/assets/6606a08a-2486-4920-8fb2-3d9b41d3e727" />



