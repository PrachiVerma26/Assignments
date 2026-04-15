package model;

public class User {
    private Long id;
    private String name;
    private int age;
    private String role;

    //default-constructor
    User(){
    }

    //all-arguments-constructor
    User(Long id, String name, int age, String role){
        this.id=id;
        this.name=name;
        this.age=age;
        this.role=role;
    }

    //getters
    public Long getId() {
        return id;
    }
    public String getName() {
        return name;
    }
    public int getAge() {
        return age;
    }
    public String getRole() {
        return role;
    }

    //setters
    public void setId(Long id) {
        this.id = id;
    }
    public void setName(String name) {
        this.name = name;
    }
    public void setAge(int age) {
        this.age = age;
    }
    public void setRole(String role) {
        this.role = role;
    }
}
