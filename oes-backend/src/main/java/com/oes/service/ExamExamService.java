package com.oes.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.oes.common.base.PageResult;
import com.oes.entity.ExamExam;
import com.oes.entity.ExamExamRecord;
import com.oes.entity.ExamStatistics;
import com.oes.entity.SysClassMember;
import com.oes.mapper.ExamExamMapper;
import com.oes.mapper.ExamStatisticsMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExamExamService extends ServiceImpl<ExamExamMapper, ExamExam> {

    private final ExamStatisticsMapper examStatisticsMapper;
    private final ExamExamRecordService examExamRecordService;
    private final SysClassMemberService sysClassMemberService;

    public ExamExamService(ExamStatisticsMapper examStatisticsMapper,
                          ExamExamRecordService examExamRecordService,
                          SysClassMemberService sysClassMemberService) {
        this.examStatisticsMapper = examStatisticsMapper;
        this.examExamRecordService = examExamRecordService;
        this.sysClassMemberService = sysClassMemberService;
    }

    public PageResult<ExamExam> page(Integer current, Integer size, Long subjectId, String status, String keyword) {
        Page<ExamExam> page = new Page<>(current, size);
        LambdaQueryWrapper<ExamExam> wrapper = new LambdaQueryWrapper<>();
        if (subjectId != null) {
            wrapper.eq(ExamExam::getSubjectId, subjectId);
        }
        if (StringUtils.hasText(status)) {
            wrapper.eq(ExamExam::getStatus, status);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.like(ExamExam::getTitle, keyword);
        }
        wrapper.orderByDesc(ExamExam::getCreateTime);
        IPage<ExamExam> result = page(page, wrapper);
        return new PageResult<>(result.getTotal(), result.getRecords(), (long) current, (long) size);
    }

    public PageResult<Map<String, Object>> studentPageWithStatus(Integer current, Integer size, Long studentId, String keyword, String status) {
        List<ExamExamRecord> studentRecords = examExamRecordService.getByStudentId(studentId);
        
        if (studentRecords == null || studentRecords.isEmpty()) {
            return new PageResult<>(0L, new ArrayList<>(), (long) current, (long) size);
        }
        
        List<Long> examIds = studentRecords.stream().map(ExamExamRecord::getExamId).collect(Collectors.toList());
        
        Page<ExamExam> page = new Page<>(current, size);
        LambdaQueryWrapper<ExamExam> wrapper = new LambdaQueryWrapper<>();
        
        wrapper.in(ExamExam::getId, examIds);
        
        if (StringUtils.hasText(status)) {
            wrapper.eq(ExamExam::getStatus, status);
        }
        
        if (StringUtils.hasText(keyword)) {
            wrapper.like(ExamExam::getTitle, keyword);
        }
        
        wrapper.orderByDesc(ExamExam::getCreateTime);
        IPage<ExamExam> result = page(page, wrapper);
        
        Map<Long, ExamExamRecord> recordMap = studentRecords.stream()
                .collect(Collectors.toMap(ExamExamRecord::getExamId, r -> r));
        
        List<Map<String, Object>> resultList = new ArrayList<>();
        for (ExamExam exam : result.getRecords()) {
            Map<String, Object> map = new HashMap<>();
            map.put("exam", exam);
            
            ExamExamRecord record = recordMap.get(exam.getId());
            if (record != null) {
                if ("SUBMITTED".equals(record.getStatus())) {
                    map.put("studentStatus", "SUBMITTED");
                } else if ("AUTO_SUBMITTED".equals(record.getStatus())) {
                    map.put("studentStatus", "AUTO_SUBMITTED");
                } else if ("ONGOING".equals(record.getStatus())) {
                    map.put("studentStatus", "ONGOING");
                } else {
                    map.put("studentStatus", "NOT_STARTED");
                }
            } else {
                map.put("studentStatus", "NOT_STARTED");
            }
            resultList.add(map);
        }
        
        return new PageResult<>(result.getTotal(), resultList, (long) current, (long) size);
    }

    @Transactional
    public boolean createExam(ExamExam exam) {
        exam.setStatus("PENDING");
        boolean created = save(exam);
        if (created) {
            // 创建成功后自动发布考试（为学生创建考试记录）
            publishExam(exam.getId());
        }
        return created;
    }

    public boolean updateExam(ExamExam exam) {
        return updateById(exam);
    }

    @Transactional
    public boolean publishExam(Long examId) {
        ExamExam exam = getById(examId);
        if (exam == null) {
            throw new RuntimeException("考试不存在");
        }
        
        List<Long> classIds = getClassIds(exam);
        
        if (classIds.isEmpty()) {
            throw new RuntimeException("请先选择发布班级");
        }
        
        Set<Long> studentIds = new HashSet<>();
        for (Long classId : classIds) {
            List<SysClassMember> members = sysClassMemberService.getMembersByClassId(classId);
            if (members != null) {
                for (SysClassMember member : members) {
                    if ("STUDENT".equals(member.getRole()) || "MEMBER".equals(member.getRole())) {
                        studentIds.add(member.getUserId());
                    }
                }
            }
        }
        
        if (studentIds.isEmpty()) {
            throw new RuntimeException("所选班级没有学生");
        }
        
        exam.setStudentIds(studentIds.stream().map(String::valueOf).collect(Collectors.joining(",")));
        exam.setStatus("PENDING");
        boolean updated = updateById(exam);
        
        if (updated) {
            for (Long studentId : studentIds) {
                ExamExamRecord existingRecord = examExamRecordService.getByExamAndStudent(examId, studentId);
                if (existingRecord == null) {
                    ExamExamRecord record = new ExamExamRecord();
                    record.setExamId(examId);
                    record.setStudentId(studentId);
                    record.setPaperId(exam.getPaperId());
                    record.setStatus("PENDING");
                    record.setScreenSwitchCount(0);
                    record.setIsSuspicious(0);
                    record.setIsAutoSubmit(0);
                    examExamRecordService.save(record);
                }
            }
        }
        
        return updated;
    }

    public boolean startExam(Long examId) {
        ExamExam exam = getById(examId);
        if (exam == null) {
            throw new RuntimeException("考试不存在");
        }
        exam.setStatus("ONGOING");
        return updateById(exam);
    }

    public boolean finishExam(Long examId) {
        ExamExam exam = getById(examId);
        if (exam == null) {
            throw new RuntimeException("考试不存在");
        }
        exam.setStatus("FINISHED");
        return updateById(exam);
    }

    public boolean extendTime(Long examId, Integer extraMinutes) {
        ExamExam exam = getById(examId);
        if (exam == null) {
            throw new RuntimeException("考试不存在");
        }
        exam.setDuration(exam.getDuration() + extraMinutes);
        return updateById(exam);
    }

    public boolean extendExam(Long examId, Integer minutes) {
        ExamExam exam = getById(examId);
        if (exam == null) {
            throw new RuntimeException("考试不存在");
        }
        exam.setEndTime(exam.getEndTime().plusMinutes(minutes));
        return updateById(exam);
    }

    public List<Long> getClassIds(ExamExam exam) {
        if (!StringUtils.hasText(exam.getClassIds())) {
            return List.of();
        }
        return Arrays.stream(exam.getClassIds().split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::parseLong)
                .collect(Collectors.toList());
    }

    public Long countByStatus(String status) {
        return count(new LambdaQueryWrapper<ExamExam>().eq(ExamExam::getStatus, status));
    }

    public ExamStatistics getStatistics(Long examId) {
        ExamStatistics stats = examStatisticsMapper.selectOne(
                new LambdaQueryWrapper<ExamStatistics>().eq(ExamStatistics::getExamId, examId));
        if (stats == null) {
            stats = new ExamStatistics();
            stats.setExamId(examId);
            stats.setTotalStudents(0);
            stats.setSubmittedCount(0);
            stats.setAvgScore(java.math.BigDecimal.ZERO);
            stats.setMaxScore(0);
            stats.setMinScore(0);
            stats.setPassRate(java.math.BigDecimal.ZERO);
            stats.setSuspiciousCount(0);
        }
        return stats;
    }

    public Long countParticipation() {
        return examExamRecordService.count(new LambdaQueryWrapper<ExamExamRecord>()
                .in(ExamExamRecord::getStatus, Arrays.asList("SUBMITTED", "AUTO_SUBMITTED")));
    }
}