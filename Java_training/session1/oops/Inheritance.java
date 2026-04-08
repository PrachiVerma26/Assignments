package session1.oops;

//parent class : student
class Student {
    private String name;
    private int rollNo;
    private double marks;

    //constructor
    public Student(String name, int rollNo, double marks) {
        this.name = name;
        this.rollNo = rollNo;
        this.marks = marks;
    }

    //getters
    public String getName() {return name;}
    public int getRollNo() {return rollNo;}
    public double getMarks() {return marks;}

    //method - display student details
    public void displayInfo() {
        System.out.println("Student details are :");
        System.out.println("Name: " + name);
        System.out.println("Roll Number: " + rollNo);
        System.out.println("Marks: " + marks);
    }
}

//child class : graduate student(inherits from student)
class GraduateStudent extends Student {
    public String specialization;
    private String researchTopic;

    //constructor- uses super keyword to call parent constructor
    public GraduateStudent(String name,int rollNo, double marks,String specialization, String researchTopic) {
        super(name,rollNo,marks);
        this.specialization=specialization;
        this.researchTopic=researchTopic;
    }

    //additional method for graduate student
    public void displayGraduateStudentInfo() {
        displayInfo();
        System.out.println("Specialization: " + specialization);
        System.out.println("Research Topic: " + researchTopic);
    }
}
public class Inheritance {
    public static void main(String[] args) {
        //creating a graduate student object
        GraduateStudent gradStudent=new GraduateStudent("Aman Shivhare",101,96.0,"Computer Science","Artificial Intelligence");

        //displaying details
        gradStudent.displayGraduateStudentInfo();
    }
}
