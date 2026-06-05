package com.oes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class OesApplication {
    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(OesApplication.class, args);
        
        System.out.println("========== Application Started ==========");
        System.out.println("Number of beans: " + context.getBeanDefinitionCount());
        
        // 检查控制器是否被注册
        if (context.containsBean("sysUserController")) {
            System.out.println("SysUserController is registered");
        } else {
            System.out.println("SysUserController is NOT registered");
        }
        
        // 检查服务是否被注册
        if (context.containsBean("sysLogService")) {
            System.out.println("SysLogService is registered");
        } else {
            System.out.println("SysLogService is NOT registered");
        }
        
        // 检查拦截器是否被注册
        if (context.containsBean("authInterceptor")) {
            System.out.println("AuthInterceptor is registered");
        } else {
            System.out.println("AuthInterceptor is NOT registered");
        }
    }
}
