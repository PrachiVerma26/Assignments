//student data
const students= [
    {
    name: "Garima",
    marks: [
        { subject: "Math", score: 88 },
        { subject: "English", score: 82 },
        { subject: "Science", score: 74 },
        { subject: "History", score: 99 },
        { subject: "Computer", score: 88 }
        ],
    attendance: 79
    },
    {
    name: "aman",
    marks: [
        { subject: "Math", score: 90 },
        { subject: "English", score: 95 },
        { subject: "Science", score: 90 },
        { subject: "History", score: 94 },
        { subject: "Computer", score: 92 }
        ],
    attendance: 91
    },
    {
    name: "pranav",
    marks: [
        { subject: "Math", score: 60 },
        { subject: "English", score: 87},
        { subject: "Science", score: 60 },
        { subject: "History", score: 84 },
        { subject: "Computer", score: 32 }
        ],
    attendance: 80
    },
    {
    name:"shreya",
    marks:[
        {subject:'Math',score:86},
        {subject:"English",score:77},
        {subject:"Science", score:40},
        {subject:"History", score:90},
        {subject:"Computer", score:67}
    ],
    attendance:90
    }
    
];
// 1. total Marks for each student
function calTotalMarks(student){
    let total=0;
    for (let mark of student.marks){
            total+=mark.score;
    }
    return total;    
}
console.log("1. total marks for each student : ");
students.forEach((student)=>{ 
    totalmarks=calTotalMarks(student);
    console.log(student.name + " total marks :"+ totalmarks);
});

//2.Average marks for each student
function avgmarks(students){
    for (let student of students){
        let totalmark=calTotalMarks(student);
        let subjectcount=student.marks.length;
        console.log(student.name +" average " + totalmark/subjectcount);
    }
}
console.log("2. Average marks for each student : ");
avgmarks(students);

//3. Subject wise highest score in the class
function subjectHighScore(students){
    let[firstStduent,...restStudents]=students; //used spread for spliting first student and rest of the students
    for(let mark of firstStduent.marks){
        let subject=mark.subject;
        let highestScore=mark.score;
        let name=firstStduent.name;
        for(let student of restStudents){
            for (let mark of student.marks){
                if(mark.subject===subject){ //comparing current subject(mark.subject) with the subject(first student subject assigned)
                    if(mark.score>highestScore){
                        highestScore=mark.score;
                        name=student.name;
                    }
                }
            }
        }
        console.log("Highest in " + currSub+ " : "+ name +" ( " +highestScore+" ) ");
    }
}
console.log("3. highest Score subject wise for each student : ")
subjectHighScore(students);

//4. Subject wise average marks 
function averageSubjectMarks(students){
    let subjectInfo={}; //storing total mark and no of student
    for(let student of students){
        for (let mark of student.marks){
            let subject=mark.subject;

            //if subject info is empty
            if(!subjectInfo[subject]){
                subjectInfo[subject] = {totalMarks:0,studentCount:0};
            }
            subjectInfo[subject].totalMarks+=mark.score;
            subjectInfo[subject].studentCount+=1;
        }
    }
    //printing the result
    for(let subject in subjectInfo){
        let total=subjectInfo[subject].totalMarks;
        let count=subjectInfo[subject].studentCount;
        let avg=total/count;
        console.log("Average "+subject+" score : "+avg);
    }
}
console.log("4. Subject wise average marks : ");
averageSubjectMarks(students);

//5.class topper
function classTopper(students){
    let topperMarks=0;
    let topperName="";
    for (let student of students){
        if (topperMarks < calTotalMarks(student)){
            topperMarks=calTotalMarks(student);
            topperName=student.name;
        }
        console.log(topperName+ " with " + topperMarks +" marks");

    }
}
console.log("5. Class Topper : ");
classTopper(students);

//assign grades based on some criterias

function gradeAssign(students){
    //check failure of student by any subject or if the student attendance is low
    students.forEach((student)=>{
        //average
        let total=calTotalMarks(student);
        let avg=total /student.marks.length;
        let subfail=false;
        student.marks.forEach((mark)=>{
            if(mark.score <= 40){
                subfail=true;
            console.log(student.name+" Grade : Fail( Failed in "+ mark.subject+ " ) ");
        }
        });
        if(!subfail){
            if (student.attendance<75){
            console.log(student.name+"Grade: Fail(low Attendance)");
            }
                //assign grade
            else{
                if ( avg >=85) console.log(student.name+ ": Grade A");
                else if(avg>=70) console.log(student.name+ ": Grade B");
                else if( avg>=50) console.log(student.name + ": Grade C");
                else console.log(student.name+ " : Fail");
            }
        }
        });
}
console.log("6. Grades of each student are : ");
gradeAssign(students);