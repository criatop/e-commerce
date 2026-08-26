package cl.ecommerce.payment.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaTopicConfig {

    @Value("${kafka.topics.payment-completed:payment.completed}")
    private String paymentCompletedTopic;

    @Value("${kafka.topics.payment-failed:payment.failed}")
    private String paymentFailedTopic;

    @Bean
    public NewTopic paymentCompletedTopic() {
        return new NewTopic(paymentCompletedTopic, 3, (short) 1);
    }

    @Bean
    public NewTopic paymentFailedTopic() {
        return new NewTopic(paymentFailedTopic, 3, (short) 1);
    }
}
