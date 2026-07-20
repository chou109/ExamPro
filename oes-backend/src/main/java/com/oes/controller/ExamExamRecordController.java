package com.oes.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.oes.common.base.PageResult;
import com.oes.common.base.R;
import com.oes.config.JwtUtils;
import com.oes.entity.*;
import com.oes.mapper.ExamWrongQuestionMapper;
import com.oes.service.*;
import javax.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/exam-records")
public class ExamExamRecordController {

    private final ExamExamRecordService examExamRecordService;
    private final ExamPaperService examPaperService;
    private final ExamExamService examExamService;
    private final ExamQuestionService examQuestionService;
    private final ExamWrongQuestionMapper examWrongQuestionMapper;
    private final ExamSubjectService examSubjectService;
    private final JwtUtils jwtUtils;
    private final SysUserService sysUserService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ExamExamRecordController(ExamExamRecordService examExamRecordService,
                                    ExamPaperService examPaperService,
                                    ExamExamService examExamService,
                                    ExamQuestionService examQuestionService,
                                    ExamWrongQuestionMapper examWrongQuestionMapper,
                                    ExamSubjectService examSubjectService,
                                    JwtUtils jwtUtils,
                                    SysUserService sysUserService) {
        this.examExamRecordService = examExamRecordService;
        this.examPaperService = examPaperService;
        this.examExamService = examExamService;
        this.examQuestionService = examQuestionService;
        this.examWrongQuestionMapper = examWrongQuestionMapper;
        this.examSubjectService = examSubjectService;
        this.jwtUtils = jwtUtils;
        this.sysUserService = sysUserService;
    }

    @GetMapping("/page")
    public R<PageResult<Map<String, Object>>> page(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long examId,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) String status) {
        PageResult<ExamExamRecord> pageResult = examExamRecordService.page(current, size, examId, studentId, status);
        
        List<Map<String, Object>> records = pageResult.getRecords().stream().map(record -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", record.getId());
            map.put("examId", record.getExamId());
            map.put("studentId", record.getStudentId());
            map.put("paperId", record.getPaperId());
            map.put("startTime", record.getStartTime());
            map.put("submitTime", record.getSubmitTime());
            map.put("score", record.getScore());
            map.put("scoreStatus", record.getScoreStatus());
            map.put("status", record.getStatus());
            map.put("isAutoSubmit", record.getIsAutoSubmit());
            map.put("createTime", record.getCreateTime());
            
            ExamExam exam = examExamService.getById(record.getExamId());
            if (exam != null) {
                map.put("examTitle", exam.getTitle());
                map.put("duration", exam.getDuration());
            }
            
            SysUser student = sysUserService.getById(record.getStudentId());
            if (student != null) {
                map.put("studentName", student.getRealName());
            }
            
            return map;
        }).collect(Collectors.toList());
        
        return R.ok(new PageResult<>(pageResult.getTotal(), records, (long) current, (long) size));
    }

    @GetMapping("/{id}")
    public R<Map<String, Object>> getById(@PathVariable Long id) {
        ExamExamRecord record = examExamRecordService.getById(id);
        if (record == null) {
            return R.error("考试记录不存在");
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("id", record.getId());
        result.put("examId", record.getExamId());
        result.put("studentId", record.getStudentId());
        result.put("paperId", record.getPaperId());
        result.put("startTime", record.getStartTime());
        result.put("submitTime", record.getSubmitTime());
        result.put("score", record.getScore());
        result.put("scoreStatus", record.getScoreStatus());
        result.put("answerData", record.getAnswerData());
        result.put("questionOrder", record.getQuestionOrder());
        result.put("optionOrder", record.getOptionOrder());
        result.put("screenSwitchCount", record.getScreenSwitchCount());
        result.put("leaveCount", record.getLeaveCount());
        result.put("isSuspicious", record.getIsSuspicious());
        result.put("isAutoSubmit", record.getIsAutoSubmit());
        result.put("status", record.getStatus());
        result.put("createTime", record.getCreateTime());
        result.put("updateTime", record.getUpdateTime());
        
        ExamExam exam = examExamService.getById(record.getExamId());
        if (exam != null) {
            result.put("exam", exam);
        }
        
        if (record.getPaperId() != null) {
            ExamPaper paper = examPaperService.getById(record.getPaperId());
            if (paper != null) {
                result.put("questions", examPaperService.getQuestions(paper));
            }
        }
        
        List<ExamAnswer> answers = examExamRecordService.getAnswersByRecordId(id);
        if (!answers.isEmpty()) {
            Map<String, Object> answerMap = new HashMap<>();
            List<Map<String, Object>> studentAnswers = new ArrayList<>();
            for (ExamAnswer answer : answers) {
                answerMap.put(String.valueOf(answer.getQuestionId()), answer.getAnswer());
                Map<String, Object> sa = new HashMap<>();
                sa.put("questionId", answer.getQuestionId());
                sa.put("answer", answer.getAnswer());
                sa.put("isCorrect", answer.getIsCorrect());
                sa.put("score", answer.getScore());
                studentAnswers.add(sa);
            }
            result.put("answerMap", answerMap);
            result.put("studentAnswers", studentAnswers);
        }
        
        return R.ok(result);
    }

    @PostMapping("/start")
    public R<Map<String, Object>> startExam(@RequestBody Map<String, Long> params, HttpServletRequest request) {
        Long examId = params.get("examId");
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        Long studentId = jwtUtils.getUserIdFromToken(token);

        ExamExam exam = examExamService.getById(examId);
        if (exam == null) {
            return R.error("考试不存在");
        }

        ExamExamRecord existRecord = examExamRecordService.getByExamAndStudent(examId, studentId);
        
        if (existRecord != null && "ONGOING".equals(existRecord.getStatus())) {
            Map<String, Object> result = new HashMap<>();
            result.put("recordId", existRecord.getId());
            result.put("record", existRecord);
            result.put("exam", exam);
            result.put("paper", examPaperService.getById(existRecord.getPaperId()));
            result.put("questions", examPaperService.getQuestions(examPaperService.getById(existRecord.getPaperId())));
            result.put("duration", exam.getDuration());
            result.put("totalScore", exam.getTotalScore());
            result.put("examConfig", exam.getAntiCheatConfig());
            result.put("leaveCount", existRecord.getLeaveCount() != null ? existRecord.getLeaveCount() : 0);
            
            String startTimeStr = existRecord.getStartTime() != null ? existRecord.getStartTime().toString() : null;
            result.put("startTime", startTimeStr);
            
            List<ExamAnswer> savedAnswers = examExamRecordService.getAnswersByRecordId(existRecord.getId());
            
            Map<Long, Map<String, Object>> answerMap = new HashMap<>();
            Map<String, String> studentAnswers = new HashMap<>();
            for (ExamAnswer answer : savedAnswers) {
                Map<String, Object> answerInfo = new HashMap<>();
                answerInfo.put("answer", answer.getAnswer());
                answerMap.put(answer.getQuestionId(), answerInfo);
                studentAnswers.put(String.valueOf(answer.getQuestionId()), answer.getAnswer());
            }
            result.put("answerMap", answerMap);
            result.put("studentAnswers", studentAnswers);
            
            return R.ok(result);
        } else if (existRecord != null && ("SUBMITTED".equals(existRecord.getStatus()) || "AUTO_SUBMITTED".equals(existRecord.getStatus()))) {
            // 允许已提交的学生查看结果
            Map<String, Object> result = new HashMap<>();
            result.put("recordId", existRecord.getId());
            result.put("record", existRecord);
            result.put("exam", exam);
            result.put("paper", examPaperService.getById(existRecord.getPaperId()));
            result.put("questions", examPaperService.getQuestions(examPaperService.getById(existRecord.getPaperId())));
            result.put("duration", exam.getDuration());
            result.put("totalScore", exam.getTotalScore());
            result.put("examConfig", exam.getAntiCheatConfig());

            // 获取学生答案和评分信息
            List<ExamAnswer> answers = examExamRecordService.getAnswersByRecordId(existRecord.getId());
            Map<Long, Map<String, Object>> answerMap = new HashMap<>();
            Map<String, String> studentAnswers = new HashMap<>();
            boolean hasSubjectiveUngraded = false;

            for (ExamAnswer answer : answers) {
                Map<String, Object> answerInfo = new HashMap<>();
                answerInfo.put("answer", answer.getAnswer());
                answerInfo.put("isCorrect", answer.getIsCorrect());
                answerInfo.put("score", answer.getScore() != null ? answer.getScore() : answer.getAutoScore());
                
                studentAnswers.put(String.valueOf(answer.getQuestionId()), answer.getAnswer());

                ExamQuestion question = examQuestionService.getById(answer.getQuestionId());
                if (question != null) {
                    answerInfo.put("correctAnswer", question.getAnswer());
                    // 判断是否为主观题且未评分（需要检查autoScore和manualScore）
                    if (isSubjective(question.getType())) {
                        Integer totalScore = answer.getScore() != null ? answer.getScore() : 
                                (answer.getAutoScore() != null ? answer.getAutoScore() : 0) + 
                                (answer.getManualScore() != null ? answer.getManualScore() : 0);
                        if (totalScore == 0) {
                            hasSubjectiveUngraded = true;
                        }
                    }
                }
                answerMap.put(answer.getQuestionId(), answerInfo);
            }
            result.put("answerMap", answerMap);
            result.put("studentAnswers", studentAnswers);
            result.put("hasSubjectiveUngraded", hasSubjectiveUngraded);

            boolean allowView = false;
            
            if (exam.getAllowViewAfterExam() != null) {
                allowView = exam.getAllowViewAfterExam() == 1;
            } else if (exam.getAntiCheatConfig() != null) {
                try {
                    Map<String, Object> config = objectMapper.readValue(exam.getAntiCheatConfig(), Map.class);
                    if (config != null && config.containsKey("allowViewAfterExam")) {
                        allowView = Boolean.TRUE.equals(config.get("allowViewAfterExam"));
                    }
                } catch (Exception e) {
                    allowView = false;
                }
            } else {
                allowView = false;
            }
            if (hasSubjectiveUngraded) {
                allowView = false;
            }
            result.put("canViewPaper", allowView);
            result.put("studentScore", existRecord.getScore());

            return R.ok(result);
        } else if (existRecord != null && "PENDING".equals(existRecord.getStatus())) {
            // 允许状态为PENDING的学生开始考试，需要更新状态为ONGOING并设置开始时间
            existRecord.setStatus("ONGOING");
            existRecord.setStartTime(LocalDateTime.now());
            examExamRecordService.updateById(existRecord);
            
            Map<String, Object> result = new HashMap<>();
            result.put("recordId", existRecord.getId());
            result.put("record", existRecord);
            result.put("exam", exam);
            result.put("paper", examPaperService.getById(existRecord.getPaperId()));
            result.put("questions", examPaperService.getQuestions(examPaperService.getById(existRecord.getPaperId())));
            result.put("duration", exam.getDuration());
            result.put("totalScore", exam.getTotalScore());
            result.put("examConfig", exam.getAntiCheatConfig());
            result.put("leaveCount", 0);
            result.put("startTime", existRecord.getStartTime().toString());
            return R.ok(result);
        } else if (existRecord != null) {
            return R.error("您已参加过此考试");
        }

        ExamPaper paper = examPaperService.getById(exam.getPaperId());
        if (paper == null) {
            return R.error("试卷不存在");
        }

        List<Long> questionIds = examPaperService.getQuestionIds(paper);
        Collections.shuffle(questionIds);

        Map<String, Object> result = new HashMap<>();
        result.put("recordId", existRecord != null ? existRecord.getId() :
                examExamRecordService.startExam(examId, studentId, exam.getPaperId(),
                        String.join(",", questionIds.stream().map(String::valueOf).collect(Collectors.toList())),
                        "").getId());
        result.put("questions", examPaperService.getQuestions(paper));
        result.put("duration", exam.getDuration());
        result.put("totalScore", exam.getTotalScore());
        result.put("examConfig", exam.getAntiCheatConfig());

        return R.ok(result);
    }

    @PostMapping("/answer")
    public R<Void> saveAnswer(@RequestBody Map<String, Object> params, HttpServletRequest request) {
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        Long studentId = jwtUtils.getUserIdFromToken(token);

        Long recordId = Long.valueOf(params.get("recordId").toString());
        Long questionId = Long.valueOf(params.get("questionId").toString());
        String answer = params.get("answer").toString();

        examExamRecordService.saveAnswer(recordId, studentId, questionId, answer);
        return R.ok();
    }

    @PostMapping("/auto-save")
    public R<Void> autoSave(@RequestBody Map<String, Object> params, HttpServletRequest request) {
        try {
            String token = request.getHeader("Authorization").replace("Bearer ", "");
            Long studentId = jwtUtils.getUserIdFromToken(token);

            Long recordId = Long.valueOf(params.get("recordId").toString());
            Map<String, String> answers = (Map<String, String>) params.get("answers");

            if (answers != null) {
                for (Map.Entry<String, String> entry : answers.entrySet()) {
                    Long questionId = Long.valueOf(entry.getKey());
                    String answer = entry.getValue();
                    examExamRecordService.saveAnswer(recordId, studentId, questionId, answer);
                }
            }
            return R.ok();
        } catch (Exception e) {
            return R.error("自动保存失败: " + e.getMessage());
        }
    }

    @PostMapping("/submit/{recordId}")
    public R<Void> submit(@PathVariable Long recordId) {
        try {
            examExamRecordService.submitExam(recordId);
            return R.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return R.error("交卷失败: " + e.getMessage());
        }
    }

    @PostMapping("/auto-submit/{recordId}")
    public R<Void> autoSubmit(@PathVariable Long recordId) {
        try {
            examExamRecordService.submitExamAuto(recordId);
            return R.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return R.error("强制收卷失败: " + e.getMessage());
        }
    }

    @PostMapping("/screen-switch")
    public R<Void> recordScreenSwitch(@RequestBody Map<String, Long> params) {
        Long recordId = params.get("recordId");
        examExamRecordService.incrementScreenSwitch(recordId);

        ExamExamRecord record = examExamRecordService.getById(recordId);
        if (record != null && record.getScreenSwitchCount() >= 3) {
            examExamRecordService.submitExam(recordId);
            return R.error("切屏次数过多，已自动交卷");
        }
        return R.ok();
    }

    @PostMapping("/report-leave")
    public R<Void> reportLeave(@RequestBody Map<String, Object> params) {
        Long recordId = Long.valueOf(params.get("recordId").toString());
        Integer leaveCount = Integer.valueOf(params.get("leaveCount").toString());
        examExamRecordService.updateLeaveCount(recordId, leaveCount);
        return R.ok();
    }

    @GetMapping("/{id}/answers")
    public R<List<ExamAnswer>> getAnswers(@PathVariable Long id) {
        return R.ok(examExamRecordService.getAnswersByRecordId(id));
    }

    @GetMapping("/student/history")
    public R<PageResult<Map<String, Object>>> getStudentHistory(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            HttpServletRequest request) {
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        Long studentId = jwtUtils.getUserIdFromToken(token);

        PageResult<ExamExamRecord> pageResult = examExamRecordService.page(current, size, null, studentId, null);

        List<Map<String, Object>> records = pageResult.getRecords().stream().map(record -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", record.getId());
            map.put("examId", record.getExamId());
            map.put("score", record.getScore());
            map.put("submitTime", record.getSubmitTime());
            map.put("status", record.getStatus());
            map.put("studentStatus", record.getStatus());

            ExamExam exam = examExamService.getById(record.getExamId());
            if (exam != null) {
                map.put("examTitle", exam.getTitle());
                map.put("subjectId", exam.getSubjectId());
                map.put("duration", exam.getDuration());
            }
            return map;
        }).collect(Collectors.toList());

        return R.ok(new PageResult<>(pageResult.getTotal(), records, (long) current, (long) size));
    }

    @GetMapping("/analysis")
    public R<Map<String, Object>> getAnalysis(@RequestParam(required = false) Long examId, HttpServletRequest request) {
        if (examId != null) {
            return R.ok(examExamRecordService.getExamAnalysis(examId));
        }
        
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.replace("Bearer ", "");
            Long studentId = jwtUtils.getUserIdFromToken(token);
            return R.ok(examExamRecordService.getStudentAnalysis(studentId));
        }
        
        return R.error("无法获取用户信息");
    }

    @GetMapping("/student/stats")
    public R<Map<String, Object>> getStudentStats(HttpServletRequest request) {
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        Long studentId = jwtUtils.getUserIdFromToken(token);

        Map<String, Object> stats = new HashMap<>();

        // 待考考试数量（未开始或进行中的考试）
        Long pendingCount = examExamRecordService.countByStudentAndStatus(studentId, "NOT_STARTED");
        Long ongoingCount = examExamRecordService.countByStudentAndStatus(studentId, "ONGOING");
        stats.put("pendingExams", pendingCount + ongoingCount);

        // 已完成考试数量（包括主动提交和强制收卷）
        Long submittedCount = examExamRecordService.countByStudentAndStatus(studentId, "SUBMITTED");
        Long autoSubmittedCount = examExamRecordService.countByStudentAndStatus(studentId, "AUTO_SUBMITTED");
        stats.put("completedExams", submittedCount + autoSubmittedCount);

        // 错题数量
        Long wrongCount = examWrongQuestionMapper.selectCount(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.oes.entity.ExamWrongQuestion>()
                        .eq(com.oes.entity.ExamWrongQuestion::getStudentId, studentId));
        stats.put("wrongCount", wrongCount);

        // 平均分
        Double averageScore = examExamRecordService.getAverageScoreByStudent(studentId);
        stats.put("averageScore", averageScore != null ? Math.round(averageScore * 10) / 10.0 : 0);

        return R.ok(stats);
    }

    @GetMapping("/student/subject-scores")
    public R<List<Map<String, Object>>> getStudentSubjectScores(HttpServletRequest request) {
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        Long studentId = jwtUtils.getUserIdFromToken(token);

        List<ExamExamRecord> records = examExamRecordService.list(new LambdaQueryWrapper<ExamExamRecord>()
                .eq(ExamExamRecord::getStudentId, studentId)
                .in(ExamExamRecord::getStatus, "SUBMITTED", "AUTO_SUBMITTED"));

        Map<Long, List<Integer>> subjectScores = new HashMap<>();

        for (ExamExamRecord record : records) {
            ExamExam exam = examExamService.getById(record.getExamId());
            if (exam != null && record.getScore() != null) {
                subjectScores.computeIfAbsent(exam.getSubjectId(), k -> new ArrayList<>()).add(record.getScore());
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();

        for (Map.Entry<Long, List<Integer>> entry : subjectScores.entrySet()) {
            Long subjectId = entry.getKey();
            List<Integer> scores = entry.getValue();

            ExamSubject subject = examSubjectService.getById(subjectId);
            String subjectName = subject != null ? subject.getName() : "未知科目";

            double avgScore = scores.stream().mapToInt(Integer::intValue).average().orElse(0);

            Map<String, Object> subjectScore = new HashMap<>();
            subjectScore.put("subjectId", subjectId);
            subjectScore.put("subjectName", subjectName);
            subjectScore.put("avgScore", Math.round(avgScore * 10) / 10.0);
            subjectScore.put("examCount", scores.size());

            result.add(subjectScore);
        }

        return R.ok(result);
    }

    @GetMapping("/student/score-trend")
    public R<List<Map<String, Object>>> getScoreTrend(HttpServletRequest request) {
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        Long studentId = jwtUtils.getUserIdFromToken(token);

        List<ExamExamRecord> records = examExamRecordService.list(new LambdaQueryWrapper<ExamExamRecord>()
                .eq(ExamExamRecord::getStudentId, studentId)
                .in(ExamExamRecord::getStatus, "SUBMITTED", "AUTO_SUBMITTED")
                .orderByAsc(ExamExamRecord::getSubmitTime));

        List<Map<String, Object>> result = new ArrayList<>();

        for (ExamExamRecord record : records) {
            ExamExam exam = examExamService.getById(record.getExamId());
            if (exam != null && record.getScore() != null) {
                Map<String, Object> trendData = new HashMap<>();
                trendData.put("examId", exam.getId());
                trendData.put("examTitle", exam.getTitle());
                trendData.put("score", record.getScore());
                trendData.put("submitTime", record.getSubmitTime());
                result.add(trendData);
            }
        }

        return R.ok(result);
    }

    @GetMapping("/student/knowledge-mastery")
    public R<List<Map<String, Object>>> getKnowledgeMastery(HttpServletRequest request) {
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        Long studentId = jwtUtils.getUserIdFromToken(token);

        // 获取所有科目
        List<ExamSubject> subjects = examSubjectService.list();
        List<Map<String, Object>> result = new ArrayList<>();

        for (ExamSubject subject : subjects) {
            // 获取该科目的错题统计
            List<ExamWrongQuestion> wrongQuestions = examWrongQuestionMapper.selectList(
                    new LambdaQueryWrapper<ExamWrongQuestion>()
                            .eq(ExamWrongQuestion::getStudentId, studentId));

            // 获取该科目相关的错题
            List<ExamWrongQuestion> subjectWrongQuestions = wrongQuestions.stream()
                    .filter(wq -> {
                        ExamQuestion question = examQuestionService.getById(wq.getQuestionId());
                        return question != null && question.getSubjectId().equals(subject.getId());
                    })
                    .collect(Collectors.toList());

            if (subjectWrongQuestions.isEmpty()) {
                continue;
            }

            // 计算掌握情况
            int totalQuestions = subjectWrongQuestions.size();
            int masteredQuestions = (int) subjectWrongQuestions.stream()
                    .filter(wq -> wq.getMastered() != null && wq.getMastered() == 1)
                    .count();

            // 计算平均正确率
            double avgCorrectRate = subjectWrongQuestions.stream()
                    .mapToDouble(wq -> {
                        int practiced = wq.getPracticedCount() != null ? wq.getPracticedCount() : 0;
                        int correct = wq.getCorrectCount() != null ? wq.getCorrectCount() : 0;
                        return practiced > 0 ? (double) correct / practiced : 0;
                    })
                    .average()
                    .orElse(0);

            Map<String, Object> masteryData = new HashMap<>();
            masteryData.put("subjectId", subject.getId());
            masteryData.put("subjectName", subject.getName());
            masteryData.put("totalQuestions", totalQuestions);
            masteryData.put("masteredQuestions", masteredQuestions);
            masteryData.put("masteryRate", Math.round((double) masteredQuestions / totalQuestions * 100));
            masteryData.put("correctRate", Math.round(avgCorrectRate * 100));

            result.add(masteryData);
        }

        return R.ok(result);
    }

    @GetMapping("/teacher/exam-stats/{examId}")
    public R<Map<String, Object>> getExamStats(@PathVariable Long examId) {
        ExamExam exam = examExamService.getById(examId);
        if (exam == null) {
            return R.error("考试不存在");
        }

        List<ExamExamRecord> records = examExamRecordService.list(new LambdaQueryWrapper<ExamExamRecord>()
                .eq(ExamExamRecord::getExamId, examId)
                .in(ExamExamRecord::getStatus, "SUBMITTED", "AUTO_SUBMITTED"));

        Map<String, Object> result = new HashMap<>();
        result.put("examTitle", exam.getTitle());
        result.put("totalStudents", records.size());
        result.put("examId", examId);

        if (records.isEmpty()) {
            result.put("highestScore", 0);
            result.put("lowestScore", 0);
            result.put("averageScore", 0);
            result.put("passRate", 0);
            result.put("passCount", 0);
            return R.ok(result);
        }

        List<Integer> scores = records.stream()
                .filter(r -> r.getScore() != null)
                .map(ExamExamRecord::getScore)
                .collect(Collectors.toList());

        int highestScore = scores.stream().mapToInt(Integer::intValue).max().orElse(0);
        int lowestScore = scores.stream().mapToInt(Integer::intValue).min().orElse(0);
        double averageScore = scores.stream().mapToInt(Integer::intValue).average().orElse(0);
        int passCount = (int) scores.stream().filter(s -> s >= 60).count();
        double passRate = (double) passCount / scores.size() * 100;

        result.put("highestScore", highestScore);
        result.put("lowestScore", lowestScore);
        result.put("averageScore", Math.round(averageScore * 10) / 10.0);
        result.put("passRate", Math.round(passRate * 10) / 10.0);
        result.put("passCount", passCount);

        return R.ok(result);
    }

    @GetMapping("/teacher/question-analysis/{examId}")
    public R<List<Map<String, Object>>> getQuestionAnalysis(@PathVariable Long examId) {
        ExamExam exam = examExamService.getById(examId);
        if (exam == null) {
            return R.error("考试不存在");
        }

        ExamPaper paper = examPaperService.getById(exam.getPaperId());
        if (paper == null) {
            return R.error("试卷不存在");
        }

        List<ExamQuestion> questions = examPaperService.getQuestions(paper);
        List<ExamExamRecord> records = examExamRecordService.list(new LambdaQueryWrapper<ExamExamRecord>()
                .eq(ExamExamRecord::getExamId, examId)
                .in(ExamExamRecord::getStatus, "SUBMITTED", "AUTO_SUBMITTED"));

        List<Map<String, Object>> result = new ArrayList<>();

        for (ExamQuestion question : questions) {
            Map<String, Object> analysis = new HashMap<>();
            analysis.put("questionId", question.getId());
            analysis.put("questionContent", question.getContent());
            analysis.put("questionType", question.getType());
            analysis.put("score", question.getScore());

            int totalAnswered = 0;
            int correctCount = 0;

            for (ExamExamRecord record : records) {
                List<ExamAnswer> answers = examExamRecordService.getAnswersByRecordId(record.getId());
                for (ExamAnswer answer : answers) {
                    if (answer.getQuestionId().equals(question.getId())) {
                        totalAnswered++;
                        String correctAnswer = question.getAnswer();
                        if (correctAnswer != null && correctAnswer.equals(answer.getAnswer())) {
                            correctCount++;
                        }
                        break;
                    }
                }
            }

            double correctRate = totalAnswered > 0 ? (double) correctCount / totalAnswered * 100 : 0;
            analysis.put("totalAnswered", totalAnswered);
            analysis.put("correctCount", correctCount);
            analysis.put("correctRate", Math.round(correctRate * 10) / 10.0);

            result.add(analysis);
        }

        return R.ok(result);
    }

    @GetMapping("/teacher/export/{examId}")
    public R<Map<String, Object>> exportExamScores(@PathVariable Long examId) {
        ExamExam exam = examExamService.getById(examId);
        if (exam == null) {
            return R.error("考试不存在");
        }

        List<ExamExamRecord> records = examExamRecordService.list(new LambdaQueryWrapper<ExamExamRecord>()
                .eq(ExamExamRecord::getExamId, examId)
                .in(ExamExamRecord::getStatus, "SUBMITTED", "AUTO_SUBMITTED"));

        List<Map<String, Object>> exportData = new ArrayList<>();

        for (ExamExamRecord record : records) {
            Map<String, Object> data = new HashMap<>();
            data.put("studentId", record.getStudentId());
            data.put("score", record.getScore());
            data.put("submitTime", record.getSubmitTime());
            data.put("status", record.getStatus());
            exportData.add(data);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("examTitle", exam.getTitle());
        result.put("exportTime", new Date());
        result.put("data", exportData);

        return R.ok(result);
    }

    private boolean isSubjective(String type) {
        return "FILL_BLANK".equals(type) ||
               "ESSAY".equals(type) ||
               "PROGRAMMING".equals(type);
    }

    @PutMapping("/{id}/grade")
    public R<Void> grade(@PathVariable Long id, @RequestBody Map<String, Object> params) {
        try {
            Map<Long, Integer> grades = new HashMap<>();
            Map<String, Object> gradeMap = (Map<String, Object>) params.get("grades");
            
            if (gradeMap != null) {
                for (Map.Entry<String, Object> entry : gradeMap.entrySet()) {
                    Long questionId = Long.valueOf(entry.getKey());
                    Integer score = Integer.valueOf(entry.getValue().toString());
                    grades.put(questionId, score);
                }
            }
            
            examExamRecordService.grade(id, grades);
            return R.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return R.error("评分失败: " + e.getMessage());
        }
    }
}