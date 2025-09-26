import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getAllUsers, useAuth } from '../../lib/auth';
import { getAllGrades } from '../../lib/grades';
import {
    ClassAveragePerformance,
    generateAndUploadAttendanceReport,
    generateAndUploadClassPerformanceReport,
    generateAndUploadStudentPerformanceReport,
    generateAndUploadTeacherPerformanceReport,
    getClassAveragePerformance,
    getStudentOverallPerformance,
    getTeacherPerformanceOverview,
    StudentOverallPerformance,
    TeacherPerformanceOverview,
} from '../../lib/reportGeneration';
import { getAllClasses } from '../../lib/schoolData';
import { getAllStudents } from '../../lib/students';
import { getAllSubjects } from '../../lib/subjects';
import { Grade, SchoolClass, Subject, UserProfile } from '../../lib/types';

export default function HeadteacherReportsScreen() {
  const { user, role, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [grades, setGrades] = useState<Grade[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allClasses, setAllClasses] = useState<SchoolClass[]>([]);
  const [allTeachers, setAllTeachers] = useState<UserProfile[]>([]);
  const [allStudents, setAllStudents] = useState<UserProfile[]>([]);

  // Attendance Report States
  const [attendanceStartDate, setAttendanceStartDate] = useState(new Date());
  const [showAttendanceStartDatePicker, setShowAttendanceStartDatePicker] = useState(false);
  const [attendanceEndDate, setAttendanceEndDate] = useState(new Date());
  const [showAttendanceEndDatePicker, setShowAttendanceEndDatePicker] = useState(false);
  const [selectedAttendanceClassId, setSelectedAttendanceClassId] = useState<string | undefined>(undefined);
  const [selectedAttendanceTeacherId, setSelectedAttendanceTeacherId] = useState<string | undefined>(undefined);

  // Performance Report States
  const [studentOverallPerformance, setStudentOverallPerformance] = useState<StudentOverallPerformance[]>([]);
  const [classAveragePerformance, setClassAveragePerformance] = useState<ClassAveragePerformance[]>([]);
  const [teacherPerformanceOverview, setTeacherPerformanceOverview] = useState<TeacherPerformanceOverview[]>([]);
  const [selectedStudentForPerformance, setSelectedStudentForPerformance] = useState<string | undefined>(undefined);
  const [selectedClassForPerformance, setSelectedClassForPerformance] = useState<string | undefined>(undefined);
  const [selectedTeacherForPerformance, setSelectedTeacherForPerformance] = useState<string | undefined>(undefined);

  const getUserName = useCallback((uid: string) => {
    return users.find(u => u.uid === uid)?.name || 'Unknown User';
  }, [users]);

  const getClassName = useCallback((classId: string) => {
    return allClasses.find(c => c.id === classId)?.name || 'Unknown Class';
  }, [allClasses]);

  const getSubjectName = useCallback((subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || 'Unknown Subject';
  }, [subjects]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [gradesData, usersData, subjectsData, classesData, studentsData] = await Promise.all([
        getAllGrades(),
        getAllUsers(),
        getAllSubjects(),
        getAllClasses(),
        getAllStudents(),
      ]);
      setGrades(gradesData.filter(grade => grade.status === 'approved')); // Only approved grades for reports
      setUsers(usersData);
      setSubjects(subjectsData);
      setAllClasses(classesData);
      setAllTeachers(usersData.filter(user => user.role === 'teacher' || user.role === 'headteacher'));
      setAllStudents(studentsData.filter(user => user.role === 'student')); // Filter for student profiles

      // Fetch and set performance data
      const studentPerformancePromises = studentsData.map(async student => {
        const performance = await getStudentOverallPerformance(student.id);
        return { studentId: student.id, ...performance };
      });
      const allStudentPerformance = await Promise.all(studentPerformancePromises);
      setStudentOverallPerformance(allStudentPerformance);

      const classPerformancePromises = classesData.map(async cls => {
        const studentIdsInClass = studentsData.filter(s => s.classId === cls.id).map(s => s.id);
        const performance = await getClassAveragePerformance(studentIdsInClass);
        return { classId: cls.id, ...performance };
      });
      const allClassPerformance = await Promise.all(classPerformancePromises);
      setClassAveragePerformance(allClassPerformance);

      const teacherPerformancePromises = usersData.filter(user => user.role === 'teacher' || user.role === 'headteacher').map(async teacher => {
        const performance = await getTeacherPerformanceOverview(teacher.uid);
        return { teacherId: teacher.uid, teacherName: teacher.name || teacher.email || 'Unknown', subjects: performance };
      });
      const allTeacherPerformance = await Promise.all(teacherPerformancePromises);
      setTeacherPerformanceOverview(allTeacherPerformance);

    } catch (err: any) {
      console.error("Error fetching reports data:", err);
      setError("Failed to load reports data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

  const onAttendanceStartDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || attendanceStartDate;
    setShowAttendanceStartDatePicker(false);
    setAttendanceStartDate(currentDate);
  };

  const onAttendanceEndDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || attendanceEndDate;
    setShowAttendanceEndDatePicker(false);
    setAttendanceEndDate(currentDate);
  };

  const shareReport = async (fileUri: string, fileName: string) => {
    setIsSharing(true);
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Error", "Sharing is not available on your device.");
        return;
      }
      await Sharing.shareAsync(fileUri, { UTI: 'com.adobe.pdf', mimeType: 'application/pdf', preview: true, 
        dialogTitle: `Share ${fileName}`,
      });
    } catch (err: any) {
      console.error("Error sharing report:", err);
      Alert.alert("Error", `Failed to share report: ${err.message}`);
    } finally {
      setIsSharing(false);
    }
  };

  const handleGenerateAttendanceReport = async () => {
    if (attendanceStartDate > attendanceEndDate) {
      Alert.alert("Error", "Start date cannot be after end date.");
      return;
    }
    setLoading(true);
    try {
      const reportUrl = await generateAndUploadAttendanceReport(
        { startDate: attendanceStartDate, endDate: attendanceEndDate, classId: selectedAttendanceClassId, teacherId: selectedAttendanceTeacherId },
        users, allClasses, "Comprehensive"
      );
      if (reportUrl) {
        Alert.alert("Success", "Attendance report generated and uploaded. You can now share it.");
        // You might want to provide a way to download directly or view the URL
        shareReport(reportUrl, "AttendanceReport.pdf");
      } else {
        Alert.alert("Error", "Failed to generate attendance report.");
      }
    } catch (err: any) {
      console.error("Error generating attendance report:", err);
      Alert.alert("Error", `Failed to generate report: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStudentPerformanceReport = async () => {
    setLoading(true);
    try {
      const reportUrl = await generateAndUploadStudentPerformanceReport(
        selectedStudentForPerformance, grades, users, subjects
      );
      if (reportUrl) {
        Alert.alert("Success", "Student performance report generated and uploaded. You can now share it.");
        shareReport(reportUrl, "StudentPerformanceReport.pdf");
      } else {
        Alert.alert("Error", "Failed to generate student performance report.");
      }
    } catch (err: any) {
      console.error("Error generating student performance report:", err);
      Alert.alert("Error", `Failed to generate report: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateClassPerformanceReport = async () => {
    setLoading(true);
    try {
      const reportUrl = await generateAndUploadClassPerformanceReport(
        selectedClassForPerformance, grades, users, allClasses, subjects
      );
      if (reportUrl) {
        Alert.alert("Success", "Class performance report generated and uploaded. You can now share it.");
        shareReport(reportUrl, "ClassPerformanceReport.pdf");
      } else {
        Alert.alert("Error", "Failed to generate class performance report.");
      }
    } catch (err: any) {
      console.error("Error generating class performance report:", err);
      Alert.alert("Error", `Failed to generate report: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTeacherPerformanceReport = async () => {
    setLoading(true);
    try {
      const reportUrl = await generateAndUploadTeacherPerformanceReport(
        selectedTeacherForPerformance, grades, users, subjects, allClasses
      );
      if (reportUrl) {
        Alert.alert("Success", "Teacher performance report generated and uploaded. You can now share it.");
        shareReport(reportUrl, "TeacherPerformanceReport.pdf");
      } else {
        Alert.alert("Error", "Failed to generate teacher performance report.");
      }
    } catch (err: any) {
      console.error("Error generating teacher performance report:", err);
      Alert.alert("Error", `Failed to generate report: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading reports data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports & Analytics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Attendance Reports Section */}
        <Text style={styles.sectionTitle}>Attendance Reports</Text>
        <View style={styles.cardContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Start Date:</Text>
            <TouchableOpacity onPress={() => setShowAttendanceStartDatePicker(true)} style={styles.datePickerButton}>
              <Text style={styles.datePickerButtonText}>{attendanceStartDate.toLocaleDateString()}</Text>
              <Ionicons name="calendar-outline" size={20} color="#1E90FF" />
            </TouchableOpacity>
            {showAttendanceStartDatePicker && (
              <DateTimePicker
                value={attendanceStartDate}
                mode="date"
                display="default"
                onChange={onAttendanceStartDateChange}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>End Date:</Text>
            <TouchableOpacity onPress={() => setShowAttendanceEndDatePicker(true)} style={styles.datePickerButton}>
              <Text style={styles.datePickerButtonText}>{attendanceEndDate.toLocaleDateString()}</Text>
              <Ionicons name="calendar-outline" size={20} color="#1E90FF" />
            </TouchableOpacity>
            {showAttendanceEndDatePicker && (
              <DateTimePicker
                value={attendanceEndDate}
                mode="date"
                display="default"
                onChange={onAttendanceEndDateChange}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Filter by Class (Optional):</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedAttendanceClassId}
                onValueChange={(itemValue) => setSelectedAttendanceClassId(itemValue || undefined)}
                style={styles.picker}
              >
                <Picker.Item label="All Classes" value={undefined} />
                {allClasses.map(classItem => (
                  <Picker.Item key={classItem.id} label={classItem.name} value={classItem.id} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Filter by Teacher (Optional):</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedAttendanceTeacherId}
                onValueChange={(itemValue) => setSelectedAttendanceTeacherId(itemValue || undefined)}
                style={styles.picker}
              >
                <Picker.Item label="All Teachers" value={undefined} />
                {allTeachers.map(teacher => (
                  <Picker.Item key={teacher.uid} label={teacher.name || teacher.email || 'Unknown'} value={teacher.uid} />
                ))}
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.exportButton, isSharing && { opacity: 0.6 }]}
            onPress={handleGenerateAttendanceReport}
            disabled={isSharing}
          >
            <Text style={styles.exportButtonText}>{isSharing ? 'Processing...' : 'Export Attendance Report'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionDivider} />

        {/* Performance Reports Section */}
        <Text style={styles.sectionTitle}>Performance Reports</Text>

        {/* Student Performance Filter */}
        <View style={styles.cardContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Filter Student Performance by Student (Optional):</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedStudentForPerformance}
                onValueChange={(itemValue) => setSelectedStudentForPerformance(itemValue || undefined)}
                style={styles.picker}
              >
                <Picker.Item label="All Students" value={undefined} />
                {allStudents.map(student => (
                  <Picker.Item key={student.id} label={student.name || student.email || 'Unknown'} value={student.id} />
                ))}
              </Picker>
            </View>
          </View>

          <Text style={styles.subSectionTitle}>Student Overall Performance</Text>
          {studentOverallPerformance.length === 0 ? (
            <Text style={styles.noData}>No student performance data found.</Text>
          ) : (
            <FlatList
              data={selectedStudentForPerformance
                ? studentOverallPerformance.filter(p => p.studentId === selectedStudentForPerformance)
                : studentOverallPerformance}
              renderItem={({ item }) => (
                <View style={styles.performanceCard}>
                  <Text style={styles.performanceCardTitle}>{getUserName(item.studentId)}</Text>
                  <Text style={styles.performanceCardSubtitle}>Average Grade: {item.averageGrade.toFixed(2)}%</Text>
                  <Text style={styles.performanceCardDetail}>Total Assignments Graded: {item.totalAssignments}</Text>
                </View>
              )}
              keyExtractor={item => item.studentId}
              scrollEnabled={false}
            />
          )}
          <TouchableOpacity
            style={[styles.exportButton, isSharing && { opacity: 0.6 }]}
            onPress={handleGenerateStudentPerformanceReport}
            disabled={isSharing}
          >
            <Text style={styles.exportButtonText}>{isSharing ? 'Processing...' : 'Export Student Performance Report'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionDivider} />

        {/* Class Performance Filter */}
        <View style={styles.cardContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Filter Class Performance by Class (Optional):</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedClassForPerformance}
                onValueChange={(itemValue) => setSelectedClassForPerformance(itemValue || undefined)}
                style={styles.picker}
              >
                <Picker.Item label="All Classes" value={undefined} />
                {allClasses.map(classItem => (
                  <Picker.Item key={classItem.id} label={classItem.name} value={classItem.id} />
                ))}
              </Picker>
            </View>
          </View>

          <Text style={styles.subSectionTitle}>Class Average Performance</Text>
          {classAveragePerformance.length === 0 ? (
            <Text style={styles.noData}>No class performance data found.</Text>
          ) : (
            <FlatList
              data={selectedClassForPerformance
                ? classAveragePerformance.filter(p => p.classId === selectedClassForPerformance)
                : classAveragePerformance}
              renderItem={({ item }) => (
                <View style={styles.performanceCard}>
                  <Text style={styles.performanceCardTitle}>{getClassName(item.classId)}</Text>
                  <Text style={styles.performanceCardSubtitle}>Average Grade: {item.averageGrade.toFixed(2)}%</Text>
                  <Text style={styles.performanceCardDetail}>Total Students Graded: {item.totalStudents}</Text>
                </View>
              )}
              keyExtractor={item => item.classId}
              scrollEnabled={false}
            />
          )}
          <TouchableOpacity
            style={[styles.exportButton, isSharing && { opacity: 0.6 }]}
            onPress={handleGenerateClassPerformanceReport}
            disabled={isSharing}
          >
            <Text style={styles.exportButtonText}>{isSharing ? 'Processing...' : 'Export Class Performance Report'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionDivider} />

        {/* Teacher Performance Filter */}
        <View style={styles.cardContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Filter Teacher Performance by Teacher (Optional):</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedTeacherForPerformance}
                onValueChange={(itemValue) => setSelectedTeacherForPerformance(itemValue || undefined)}
                style={styles.picker}
              >
                <Picker.Item label="All Teachers" value={undefined} />
                {allTeachers.map(teacher => (
                  <Picker.Item key={teacher.uid} label={teacher.name || teacher.email || 'Unknown'} value={teacher.uid} />
                ))}
              </Picker>
            </View>
          </View>

          <Text style={styles.subSectionTitle}>Teacher Performance Overview</Text>
          {teacherPerformanceOverview.length === 0 ? (
            <Text style={styles.noData}>No teacher performance data found.</Text>
          ) : (
            <FlatList
              data={selectedTeacherForPerformance
                ? teacherPerformanceOverview.filter(p => p.teacherId === selectedTeacherForPerformance)
                : teacherPerformanceOverview}
              renderItem={({ item }) => (
                <View style={styles.performanceCard}>
                  <Text style={styles.performanceCardTitle}>{item.teacherName}</Text>
                  {item.subjects.map((subject, index) => (
                    <View key={index} style={styles.innerRow}>
                      <Text style={styles.innerLeft}>- {getSubjectName(subject.subjectId)}</Text>
                      <Text style={styles.innerRight}>Avg: {subject.averageGrade.toFixed(2)}% ({subject.totalStudentsGraded} students)</Text>
                    </View>
                  ))}
                </View>
              )}
              keyExtractor={item => item.teacherId}
              scrollEnabled={false}
            />
          )}
          <TouchableOpacity
            style={[styles.exportButton, isSharing && { opacity: 0.6 }]}
            onPress={handleGenerateTeacherPerformanceReport}
            disabled={isSharing}
          >
            <Text style={styles.exportButtonText}>{isSharing ? 'Processing...' : 'Export Teacher Performance Report'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    padding: 15,
  },
  header: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    color: '#333',
    fontSize: 22,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginTop: 15,
    marginBottom: 10,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    justifyContent: 'space-between',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  exportButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    flexDirection: 'row',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  noData: {
    textAlign: 'center',
    color: '#666',
    fontSize: 15,
    marginTop: 10,
  },
  performanceCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  performanceCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  performanceCardSubtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  performanceCardDetail: {
    fontSize: 13,
    color: '#777',
  },
  innerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  innerLeft: {
    fontSize: 14,
    color: '#444',
  },
  innerRight: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
  },
});

