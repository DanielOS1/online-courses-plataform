import requests
import sys
import random
from datetime import datetime, timedelta
import json
from typing import Dict, List

class DatabaseSeeder:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.users = []
        self.courses = []
        self.units = []
        self.classes = []
        self.comments = []
        self.ratings = []

    def create_users(self, num_users: int = 10) -> None:
        """Crea usuarios incluyendo estudiantes e instructores"""
        print("Creando usuarios...")
        
        for i in range(num_users):
            is_instructor = i < num_users // 3
            user_data = {
                "email": f"user{i}@example.com",
                "password": "password123",
                "username": f"user{i}",
                "role": "instructor" if is_instructor else "student"
            }
            
            response = requests.post(f"{self.base_url}/users/register", json=user_data)
            if response.status_code == 201:
                #user = response.json()
                #self.users.append(user)
                print(f"Usuario creado: {user_data['email']}")
                #print("Base de datos:", user)
            else:
                print(f"Error creando usuario: {response.text}")
                print(f"Datos enviados: {user_data}")

        response = requests.get(f"{self.base_url}/users")
        self.users = response.json()

    def create_courses(self, num_courses: int = 5) -> None:
        """Crea cursos y asigna instructores"""
        print("\nCreando cursos...")
        instructors = [user for user in self.users if user.get('role') == 'instructor']
        
        for i in range(num_courses):
            course_data = {
                "name": f"Curso {i}",
                "description": f"Descripción detallada del curso {i}",
                "level": random.choice(["beginner", "intermediate", "advanced"]),
                "duration": random.randint(20, 60),
                "price": random.randint(50, 200)
            }
            
            response = requests.post(f"{self.base_url}/courses", json=course_data)
            if response.status_code == 201:
                course = response.json()
                self.courses.append(course)
                print(course)
                
                if instructors:
                    instructor = random.choice(instructors)
                    instructor_data = {"instructorId": instructor['_id']}
                    instructor_response = requests.put(
                        f"{self.base_url}/courses/{course.get('_id')}/instructor",
                        json=instructor_data
                    )
                    if instructor_response.status_code != 200:
                        print(f"Error asignando instructor: {instructor_response.text}")
                
                print(f"Curso creado: {course_data['name']}")
            else:
                print(f"Error creando curso: {response.text}")
                print(f"Datos enviados: {course_data}")

        # response = requests.get(f"{self.base_url}/courses")
        # self.courses = response.json()

    def create_units(self, units_per_course: int = 3) -> None:
        """Crea unidades para cada curso"""
        print("\nCreando unidades...")
        
        for course in self.courses:
            for i in range(units_per_course):
                unit_data = {
                    "name": f"Unidad {i} - Curso {course.get('name')}",  # Cambiado de 'title' a 'name'
                    "description": f"Descripción de la unidad {i}",
                    "courseId": course.get('_id'),
                    "order": i + 1  # Agregado campo requerido 'order'
                }
                
                response = requests.post(f"{self.base_url}/units", json=unit_data)
                if response.status_code == 201:
                    unit = response.json()
                    self.units.append(unit)
                    print(f"Unidad creada: {unit_data['name']}")
                else:
                    print(f"Error creando unidad: {response.text}")
                    print(f"Datos enviados: {unit_data}")

    def create_classes(self, classes_per_unit: int = 4) -> None:
        """Crea clases para cada unidad"""
        print("\nCreando clases...")
        
        for unit in self.units:
            for i in range(classes_per_unit):
                class_data = {
                    "name": f"Clase {i} - {unit.get('name')}",
                    "description": f"Descripción de la clase {i}",
                    "content": "Contenido detallado de la clase",
                    "duration": random.randint(30, 120),
                    "unitId": unit.get('_id')
                }
                
                response = requests.post(f"{self.base_url}/classes", json=class_data)
                if response.status_code == 201:
                    class_obj = response.json()
                    self.classes.append(class_obj)
                    print(f"Clase creada: {class_data['name']}")
                else:
                    print(f"Error creando clase: {response.text}")
                    print(f"Datos enviados: {class_data}")

    def create_comments_and_ratings(self) -> None:
        """Crea comentarios y calificaciones para los cursos"""
        print("\nCreando comentarios y calificaciones...")
        
        students = [user for user in self.users if user.get('role') == 'student']

        for course in self.courses:
            for student in random.sample(students, k=min(3, len(students))):
                comment_data = {
                    "title": f"Título del comentario de {student.get('username')}",
                    "content": f"Comentario de {student.get('username')} sobre el curso",
                    "courseId": course['_id'],
                    "authorId": student['_id']
                }
                
                response = requests.post(f"{self.base_url}/comments", json=comment_data)
                if response.status_code == 201:
                    self.comments.append(response.json())
                    print(f"Comentario creado para el curso {course.get('name')}")
                else:
                    print(f"Error creando comentario: {response.text}")
                    print(f"Datos enviados: {comment_data}")
            
            for student in random.sample(students, k=min(5, len(students))):
                rating_data = {
                    "rating": random.randint(3, 5),
                    "courseId": course['_id'],
                    "userId": student['_id']
                }
                
                response = requests.post(f"{self.base_url}/ratings", json=rating_data)
                if response.status_code == 201:
                    self.ratings.append(response.json())
                    print(f"Calificación creada para el curso {course.get('name')}")
                else:
                    print(f"Error creando calificación: {response.text}")
                    print(f"Datos enviados: {rating_data}")

    def seed_database(self) -> None:
        """Ejecuta toda la secuencia de población de la base de datos"""
        self.create_users()
        self.create_courses()
        self.create_units()
        self.create_classes()
        self.create_comments_and_ratings()
        print("\n¡Base de datos poblada exitosamente!")

def main():
    if len(sys.argv) < 2:
        print("Uso: python seeder.py <backend_url>")
        sys.exit(1)
    
    backend_url = sys.argv[1]
    seeder = DatabaseSeeder(backend_url)
    
    try:
        seeder.seed_database()
    except requests.exceptions.ConnectionError:
        print(f"Error: No se pudo conectar a {backend_url}")
        sys.exit(1)
    except Exception as e:
        print(f"Error inesperado: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
