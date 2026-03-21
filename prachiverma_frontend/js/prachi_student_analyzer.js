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
        { subject: "English", score: 95 },
        { subject: "Science", score: 40 },
        { subject: "History", score: 84 },
        { subject: "Computer", score: 32 }
        ],
    attendance: 50
    },
    {
    name:"shreya",
    marks:[
        {subject:'Math',score:86},
        {subject:"English",score:77},
        {subject:"Science", score:54},
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
console.log("2. Average marks for eahc student : ");
avgmarks(students);
